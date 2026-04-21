package controllers

import (
	"backend/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ChatPayload struct {
	Messages []services.Message `json:"messages"`
}

func HandleChat(c *gin.Context) {
	var req ChatPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	if len(req.Messages) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Messages cannot be empty"})
		return
	}

	ollama := services.NewOllamaService()
	reply, err := ollama.Chat(req.Messages)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI failure: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"reply":   reply,
	})
}
