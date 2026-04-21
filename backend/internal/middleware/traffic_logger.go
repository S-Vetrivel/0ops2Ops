package middleware

import (
	"backend/internal/config"
	"backend/internal/models"
	"backend/internal/services"
	"context"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ipTracker struct {
	Count      int
	FirstHitAt time.Time
}

var (
	requestMap = make(map[string]*ipTracker)
	mapMutex   = sync.Mutex{}
	// Thresholds representing volumetric attack
	attackThreshold = 50
	windowDuration  = 10 * time.Second
)

// TrafficLogger intercepts requests, counts IP frequency, logs generic traffic,
// and aggressively blocks attacks natively using iptables if threshold exceeded.
func TrafficLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()

		// Allow loopbacks safely to avoid banning proxy
		if clientIP == "127.0.0.1" || clientIP == "::1" || strings.HasPrefix(clientIP, "172.") {
			c.Next()
			return
		}

		mapMutex.Lock()
		tracker, exists := requestMap[clientIP]
		if !exists {
			tracker = &ipTracker{
				Count:      1,
				FirstHitAt: time.Now(),
			}
			requestMap[clientIP] = tracker
		} else {
			if time.Since(tracker.FirstHitAt) > windowDuration {
				// Reset memory window
				tracker.Count = 1
				tracker.FirstHitAt = time.Now()
			} else {
				tracker.Count++
			}
		}

		currentCount := tracker.Count
		mapMutex.Unlock()

		start := time.Now()
		c.Next()
		duration := time.Since(start)

		logType := "traffic"
		msg := "Standard Traffic"

		if currentCount > attackThreshold {
			logType = "attack"
			msg = "Volumetric Attack Detected. IP Auto-Blocked."

			go func(ip string) {
				// Orchestrate ban on the networking stack natively
				svc, err := services.NewFirewallService()
				if err == nil {
					svc.RunIptables(context.Background(), "-A", "INPUT", "-s", ip, "-j", "DROP")
					log.Printf("⚠️ Auto-Blocked Malicious IP: %s", ip)
				}
			}(clientIP)

			// Fast abort immediately
			c.AbortWithStatus(429)
		}

		// Push asynchronously to Mongo to not stall the main pipeline thread
		go func(entry models.LogEntry) {
			if !config.IsDBConnected {
				return
			}
			ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
			defer cancel()

			config.DB.Collection("logs").InsertOne(ctx, entry)
		}(models.LogEntry{
			ID:        primitive.NewObjectID(),
			Type:      logType,
			IP:        clientIP,
			Method:    c.Request.Method,
			Path:      c.Request.URL.Path,
			Status:    c.Writer.Status(),
			Message:   msg,
			CreatedAt: time.Now(),
		})

		_ = duration
	}
}
