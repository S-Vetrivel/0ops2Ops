package controllers

import (
	"backend/internal/models"
	"backend/internal/services"
	"context"
	"fmt"
	"net/http"
	"strings"

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

	var req DeployRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Initialize Service
	svc, err := services.NewDeploymentService()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to init deployment service: " + err.Error()})
		return
	}

	// 1. Clone
	path, err := svc.CloneRepo(req.RepoUrl, req.RepoName, user.GitHubAccessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Clone failed: " + err.Error()})
		return
	}

	// 2. Detect
	lang, err := svc.DetectLanguage(path)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Could not detect language: " + err.Error()})
		return
	}

	// 3. Dockerfile
	if err := svc.GenerateDockerfile(path, lang); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Dockerfile gen failed: " + err.Error()})
		return
	}

	// 4. Build
	imageName := fmt.Sprintf("%s-%s:latest", user.Username, req.RepoName)
	// Lowercase image name is required by Docker
	imageName =  cleanImageName(imageName)

	if err := svc.BuildImage(context.Background(), path, imageName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Docker build failed: " + err.Error()})
		return
	}

	// 5. Run
	appUrl, err := svc.RunContainer(context.Background(), imageName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Docker run failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"repoName": req.RepoName,
		"language": lang,
		"appUrl":   appUrl,
		"message":  "Deployment Successful!",
	})
}

func cleanImageName(name string) string {
	return strings.ToLower(name) 
}
