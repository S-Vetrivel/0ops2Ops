package services

import (
	"archive/tar"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
	"bufio"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
)

type DeploymentService struct {
	DockerClient *client.Client
}

func NewDeploymentService() (*DeploymentService, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}
	return &DeploymentService{DockerClient: cli}, nil
}

// CloneRepo clones a repository to a temporary directory
// Returns the path to the cloned repository
func (s *DeploymentService) CloneRepo(repoUrl, repoName, token string) (string, error) {
	// Use a temp dir for cloning
	tempDir := os.TempDir()
	cloneDir := filepath.Join(tempDir, "0ops2Ops_deploys", repoName+"_"+fmt.Sprintf("%d", time.Now().Unix()))

	// Clean up if exists (unlikely with timestamp)
	os.RemoveAll(cloneDir)

	// Insert token into URL for auth
	// Format: https://<token>@github.com/user/repo.git
	authUrl := strings.Replace(repoUrl, "https://", "https://"+token+"@", 1)

	cmd := exec.Command("git", "clone", authUrl, cloneDir)
	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err := cmd.Run()
	if err != nil {
		return "", fmt.Errorf("git clone failed: %s, stderr: %s", err, stderr.String())
	}

	return cloneDir, nil
}

// DetectLanguage identifies the programming language/stack
func (s *DeploymentService) DetectLanguage(path string) (string, error) {
	if _, err := os.Stat(filepath.Join(path, "package.json")); err == nil {
		return "node", nil
	}
	if _, err := os.Stat(filepath.Join(path, "requirements.txt")); err == nil {
		return "python", nil
	}
	if _, err := os.Stat(filepath.Join(path, "go.mod")); err == nil {
		return "go", nil
	}
	if _, err := os.Stat(filepath.Join(path, "index.html")); err == nil {
		return "static", nil
	}
	return "", fmt.Errorf("unknown language")
}

// GenerateDockerfile creates a Dockerfile based on the detected language or falls back to AI.
func (s *DeploymentService) GenerateDockerfile(path, language, model, previousError string, outStream io.Writer) error {
	dockerfilePath := filepath.Join(path, "Dockerfile")
	
	// If it's a completely fresh start with no errors and a known language, try static mapping
	if previousError == "" {
		if _, err := os.Stat(dockerfilePath); err == nil {
			if outStream != nil { outStream.Write([]byte("> Dockerfile already exists, skipping.\n")) }
			return nil
		}

		var content string
		switch language {
		case "node":
			content = `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`
		case "python":
			content = `FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]`
		case "go":
			content = `FROM golang:1.21-alpine
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o main .
EXPOSE 8080
CMD ["./main"]`
		case "static":
			content = `FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80`
		}

		if content != "" {
			return os.WriteFile(dockerfilePath, []byte(content), 0644)
		}
	}

	// Unknown language OR explicit Retry -> Run an AI fallback execution
	if previousError != "" {
		if outStream != nil { outStream.Write([]byte(fmt.Sprintf("> Orchestrating self-healing AI pipeline via %s...\n", model))) }
	} else {
		if outStream != nil { outStream.Write([]byte(fmt.Sprintf("> Language detection failed, orchestrating AI generation via %s...\n", model))) }
	}

	var fileListBuilder strings.Builder
	filepath.Walk(path, func(f string, fi os.FileInfo, e error) error {
		if e != nil || fi.IsDir() || strings.Contains(f, ".git") || strings.Contains(f, "node_modules") {
			return nil
		}
		rel, _ := filepath.Rel(path, f)
		fileListBuilder.WriteString(rel + "\n")
		return nil
	})
	
	if outStream != nil { outStream.Write([]byte("> Contacting local Ollama Agent...\n")) }
	ollama := NewOllamaService()
	aiDockerfile, err := ollama.GenerateDockerfile(fileListBuilder.String(), model, previousError)
	if err != nil || len(aiDockerfile) < 10 {
		if outStream != nil { outStream.Write([]byte(fmt.Sprintf("> AI Agent (%s) failed: %v\n", model, err))) }
		return fmt.Errorf("ai %s generation failed: %v", model, err)
	}
	
	if outStream != nil { 
		outStream.Write([]byte(fmt.Sprintf("> 🪄 Generated AI Dockerfile via %s:\n", model))) 
		outStream.Write([]byte(aiDockerfile + "\n\n"))
	}

	return os.WriteFile(dockerfilePath, []byte(aiDockerfile), 0644)
}

// GenerateEmptyDockerfile forcefully clears any existing Dockerfile and makes a generic alpine container
func (s *DeploymentService) GenerateEmptyDockerfile(path string) error {
	dockerfilePath := filepath.Join(path, "Dockerfile")
	content := `FROM alpine:latest
CMD ["sleep", "infinity"]`
	return os.WriteFile(dockerfilePath, []byte(content), 0644)
}

// BuildImage builds the Docker image
// BuildImage builds the Docker image and writes the JSON build stream to the given writer
func (s *DeploymentService) BuildImage(ctx context.Context, path, imageName string, outStream io.Writer) error {
	tarCtx, err := archiveDir(path)
	if err != nil {
		return err
	}

	opts := types.ImageBuildOptions{
		Tags:       []string{imageName},
		Dockerfile: "Dockerfile",
		Remove:     true,
	}

	res, err := s.DockerClient.ImageBuild(ctx, tarCtx, opts)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	// Stream logs while looking for Docker build failures
	scanner := bufio.NewScanner(res.Body)
	var lastError string

	for scanner.Scan() {
		line := scanner.Text()
		
		// Map the JSON output
		var payload struct {
			Stream      string `json:"stream"`
			ErrorDetail struct {
				Message string `json:"message"`
			} `json:"errorDetail"`
			Error string `json:"error"`
		}

		if err := json.Unmarshal([]byte(line), &payload); err == nil {
			if payload.Error != "" {
				lastError = payload.Error
			}
			// Write the stream portion out if requested
			if outStream != nil && payload.Stream != "" {
				outStream.Write([]byte(payload.Stream))
			} else if outStream != nil && payload.ErrorDetail.Message != "" {
				outStream.Write([]byte("ERROR: " + payload.ErrorDetail.Message + "\n"))
			}
		} else {
			// Raw line fallback
			if outStream != nil {
				outStream.Write([]byte(line + "\n"))
			}
		}
	}

	if lastError != "" {
		return fmt.Errorf("Docker Build Failed: %s", lastError)
	}

	return nil
}

// RunContainer starts a container from the image
func (s *DeploymentService) RunContainer(ctx context.Context, imageName string) (string, error) {
	// Inspect the image first to see what ports it wants to expose
	if _, _, err := s.DockerClient.ImageInspectWithRaw(ctx, imageName); err != nil {
		return "", fmt.Errorf("failed to inspect image: %v", err)
	}

	// Config
	config := &container.Config{
		Image: imageName,
	}

	hostConfig := &container.HostConfig{
		PublishAllPorts: true,
		AutoRemove:      false, // Disabled to allow log inspection of failed starts
	}

	resp, err := s.DockerClient.ContainerCreate(ctx, config, hostConfig, nil, nil, "")
	if err != nil {
		return "", err
	}

	if err := s.DockerClient.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		return "", err
	}

	// Inspect the container to find the dynamically assigned port
	inspect, err := s.DockerClient.ContainerInspect(ctx, resp.ID)
	if err != nil {
		return "", err
	}

	// Logic to find the "best" port: 
	// 1. If 80 is exposed, use it.
	// 2. If 3000 is exposed, use it.
	// 3. Otherwise pick the first available.

	var assignedPort string
	priorityPorts := []string{"80/tcp", "3000/tcp", "8080/tcp", "5000/tcp"}
	
	// Search by priority
	for _, p := range priorityPorts {
		if bindings, ok := inspect.NetworkSettings.Ports[nat.Port(p)]; ok && len(bindings) > 0 {
			assignedPort = bindings[0].HostPort
			break
		}
	}

	// Fallback to searching anything
	if assignedPort == "" {
		for _, bindings := range inspect.NetworkSettings.Ports {
			if len(bindings) > 0 {
				assignedPort = bindings[0].HostPort
				break
			}
		}
	}

	if assignedPort == "" {
		return "", fmt.Errorf("container started but no public port was allocated. Ports: %+v", inspect.NetworkSettings.Ports)
	}

	return fmt.Sprintf("http://localhost:%s", assignedPort), nil
}

// archiveDir creates a tar archive of a directory
func archiveDir(src string) (io.Reader, error) {
	var buf bytes.Buffer
	tw := tar.NewWriter(&buf)

	err := filepath.Walk(src, func(file string, fi os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		header, err := tar.FileInfoHeader(fi, fi.Name())
		if err != nil {
			return err
		}

		// Rel path
		rel, err := filepath.Rel(src, file)
		if err != nil {
			return err
		}

		// Fix windows paths for tar
		header.Name = filepath.ToSlash(rel)

		if err := tw.WriteHeader(header); err != nil {
			return err
		}

		if !fi.IsDir() {
			data, err := os.Open(file)
			if err != nil {
				return err
			}
			defer data.Close()
			if _, err := io.Copy(tw, data); err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		return nil, err
	}
	if err := tw.Close(); err != nil {
		return nil, err
	}
	return &buf, nil
}
