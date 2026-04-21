package controllers

import (
	"backend/internal/config"
	"backend/internal/models"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetLogs(c *gin.Context) {
	if !config.IsDBConnected {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not connected"})
		return
	}

	filterType := c.Query("type")

	// Filter
	filter := bson.M{}
	if filterType != "" {
		filter["type"] = filterType
	}

	// Options (sort descending by date, limit 100)
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(100)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.DB.Collection("logs").Find(ctx, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch logs: " + err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var logs []models.LogEntry
	if err = cursor.All(ctx, &logs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode logs: " + err.Error()})
		return
	}

	// Always return an array
	if logs == nil {
		logs = make([]models.LogEntry, 0)
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "logs": logs})
}
