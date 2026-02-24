package services

import (
	"archive/tar"
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

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

// GenerateDockerfile creates a Dockerfile based on the detected language
func (s *DeploymentService) GenerateDockerfile(path, language string) error {
	dockerfilePath := filepath.Join(path, "Dockerfile")
	// If Dockerfile exists, skip
	if _, err := os.Stat(dockerfilePath); err == nil {
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
	default:
		return fmt.Errorf("unsupported language for auto-dockerfile: %s", language)
	}

	return os.WriteFile(dockerfilePath, []byte(content), 0644)
}

// BuildImage builds the Docker image
func (s *DeploymentService) BuildImage(ctx context.Context, path, imageName string) error {
	// Create a tarball of the context
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

	// Consume output to wait for build to finish
	// In a real app, we might want to stream this to the user
	_, err = io.Copy(os.Stdout, res.Body) 
	return err
}

// RunContainer starts a container from the image
func (s *DeploymentService) RunContainer(ctx context.Context, imageName string) (string, error) {
	// Find a free port
	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		return "", err
	}
	port := listener.Addr().(*net.TCPAddr).Port
	listener.Close()

	portStr := fmt.Sprintf("%d", port)

	// Config
	config := &container.Config{
		Image: imageName,
		ExposedPorts: nat.PortSet{
			"80/tcp":   struct{}{},
			"3000/tcp": struct{}{},
			"5000/tcp": struct{}{},
			"8080/tcp": struct{}{},
		},
	}

	hostConfig := &container.HostConfig{
		PortBindings: nat.PortMap{
			"80/tcp":   []nat.PortBinding{{HostIP: "0.0.0.0", HostPort: portStr}},
			"3000/tcp": []nat.PortBinding{{HostIP: "0.0.0.0", HostPort: portStr}},
			"5000/tcp": []nat.PortBinding{{HostIP: "0.0.0.0", HostPort: portStr}},
			"8080/tcp": []nat.PortBinding{{HostIP: "0.0.0.0", HostPort: portStr}},
		},
		AutoRemove: true, // For MVP, auto-remove on exit
	}

	resp, err := s.DockerClient.ContainerCreate(ctx, config, hostConfig, nil, nil, "")
	if err != nil {
		return "", err
	}

	if err := s.DockerClient.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		return "", err
	}

	return fmt.Sprintf("http://localhost:%d", port), nil
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
