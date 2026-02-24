package controllers

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"backend/internal/config"
	"backend/internal/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

	// ListRepos fetches the list of repositories from GitHub for the logged-in user
func ListRepos(c *gin.Context) {
	u, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := u.(models.User)

	if user.GitHubAccessToken == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "GitHub Not Connected", "code": "GITHUB_NOT_CONNECTED"})
		return
	}

	// Fetch Repos from GitHub
	client := &http.Client{}
	req, err := http.NewRequest("GET", "https://api.github.com/user/repos?sort=updated&per_page=10", nil) // Limiting to 10 latest for now
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}

	req.Header.Set("Authorization", "Bearer "+user.GitHubAccessToken)
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch repositories"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		// Token might be expired or revoked
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		
		update := bson.M{"$set": bson.M{"githubAccessToken": ""}}
		config.DB.Collection("users").UpdateOne(ctx, bson.M{"_id": user.ID}, update)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "GitHub Token Invalid", "code": "GITHUB_TOKEN_INVALID"})
		return
	}

	if resp.StatusCode != http.StatusOK {
		c.JSON(resp.StatusCode, gin.H{"error": "GitHub API Error"})
		return
	}

	data, _ := io.ReadAll(resp.Body)
	var repos []map[string]interface{}
	json.Unmarshal(data, &repos)
    
    // Simplification: just return the raw list or a simplified version
	c.JSON(http.StatusOK, repos)
}
