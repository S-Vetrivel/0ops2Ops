package controllers

import (
	"backend/internal/models"
	"backend/internal/services"
	"context"
	"fmt"
	"net/http"
	"strings"
	"io"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/gin-gonic/gin"
)

type DeployRequest struct {
	RepoUrl  string `json:"repoUrl"`
	RepoName string `json:"repoName"`
}

func DeployRepo(c *gin.Context) {
	// Authentication
	u, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := u.(models.User)

	if user.GitHubAccessToken == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "GitHub Not Connected"})
		return
	}

	repoUrl := c.Query("repoUrl")
	repoName := c.Query("repoName")
	if repoUrl == "" || repoName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing parameters"})
		return
	}

	// Initialize Service
	svc, err := services.NewDeploymentService()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to init deployment service: " + err.Error()})
		return
	}

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Transfer-Encoding", "chunked")

	logChan := make(chan string, 100)
	errChan := make(chan error, 1)
	doneChan := make(chan string, 1)

	// Stream writer matching IO.Writer
	go func() {
		defer close(logChan)
		
		logChan <- "[CLONE] Cloning repository..."
		path, err := svc.CloneRepo(repoUrl, repoName, user.GitHubAccessToken)
		if err != nil {
			errChan <- fmt.Errorf("Clone failed: " + err.Error())
			return
		}

		logChan <- "[DETECT] Analyzing repository structure..."
		lang, err := svc.DetectLanguage(path)
		if err != nil {
			logChan <- "Language unclassified... Proceeding with AI Agent generation fallback\n"
			lang = "unknown"
		}

		// Create a writer that pipes to logChan
		pipeR, pipeW := io.Pipe()
		go func() {
			buf := make([]byte, 1024)
			for {
				n, err := pipeR.Read(buf)
				if n > 0 {
					logChan <- string(buf[:n])
				}
				if err != nil {
					break
				}
			}
		}()

		imageName := cleanImageName(fmt.Sprintf("%s-%s:latest", user.Username, repoName))
		
		aiModels := []string{"qwen2.5-coder:3b", "llama3.2:3b", "deepseek-coder-v2:16b-lite-instruct-q4_K_M"}
		var buildErr error
		var currentErrorLog string

		// Attempt 1: Default/Static or Primary AI
		// Attempt 2+: Progressive AI Healing
		maxAttempts := len(aiModels) + 1 // 1 for default/first try, then N models for retries
		
		for attempt := 0; attempt < maxAttempts; attempt++ {
			if attempt > 0 {
				logChan <- fmt.Sprintf("\n[HEALING] Deployment Failed! Engaging self-healing AI (Attempt %d/%d)...", attempt, maxAttempts-1)
			} else {
				logChan <- "\n[BUILD] Generating Dockerfile architecture..."
			}

			modelToUse := aiModels[0]
			if attempt > 0 {
				modelIndex := attempt - 1
				if modelIndex >= len(aiModels) {
					modelIndex = len(aiModels) - 1
				}
				modelToUse = aiModels[modelIndex]
			}

			if err := svc.GenerateDockerfile(path, lang, modelToUse, currentErrorLog, pipeW); err != nil {
				currentErrorLog = err.Error()
				continue
			}

			logChan <- "[DOCKER] Building Docker Image..."
			buildErr = svc.BuildImage(context.Background(), path, imageName, pipeW)
			if buildErr == nil {
				break // Success!
			}
			
			// Save the build error to pass to the AI in the next loop
			currentErrorLog = buildErr.Error()
		}

		// Ultimate Fallback: The Empty Deployable State
		if buildErr != nil {
			logChan <- "\n[FATAL] All AI self-healing attempts exhausted. Forcing minimal deployable state..."
			svc.GenerateEmptyDockerfile(path)
			// Final forced build
			if finalErr := svc.BuildImage(context.Background(), path, imageName, pipeW); finalErr != nil {
				errChan <- fmt.Errorf("Critical infrastructure failure. Cannot deploy empty target: %s", finalErr.Error())
				pipeW.Close()
				return
			}
		}

		pipeW.Close()

		logChan <- "\n[RUN] Starting Container..."
		appUrl, err := svc.RunContainer(context.Background(), imageName)
		if err != nil {
			errChan <- fmt.Errorf("Docker run failed: " + err.Error())
			return
		}

		doneChan <- appUrl
	}()

	c.Stream(func(w io.Writer) bool {
		select {
		case msg, ok := <-logChan:
			if !ok {
				return false
			}
			msg = strings.ReplaceAll(msg, "\n", "")
			if msg != "" {
				c.SSEvent("log", msg)
			}
			return true
		case e := <-errChan:
			c.SSEvent("error", e.Error())
			return false
		case appUrl := <-doneChan:
			c.SSEvent("success", appUrl)
			return false
		}
	})
}

func cleanImageName(name string) string {
	return strings.ToLower(name) 
}

func ListServices(c *gin.Context) {
	svc, err := services.NewDeploymentService()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to init Docker client: " + err.Error()})
		return
	}

	containers, err := svc.DockerClient.ContainerList(context.Background(), types.ContainerListOptions{All: true})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list containers: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "services": containers})
}

func ServiceAction(c *gin.Context) {
	id := c.Param("id")
	action := c.Param("action")

	svc, err := services.NewDeploymentService()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to init Docker client: " + err.Error()})
		return
	}

	ctx := context.Background()
	switch action {
	case "start":
		err = svc.DockerClient.ContainerStart(ctx, id, types.ContainerStartOptions{})
	case "stop":
		timeout := 5
		err = svc.DockerClient.ContainerStop(ctx, id, container.StopOptions{Timeout: &timeout})
	case "restart":
		timeout := 5
		err = svc.DockerClient.ContainerRestart(ctx, id, container.StopOptions{Timeout: &timeout})
	case "remove":
		err = svc.DockerClient.ContainerRemove(ctx, id, types.ContainerRemoveOptions{Force: true})
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unknown action"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Docker action failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
