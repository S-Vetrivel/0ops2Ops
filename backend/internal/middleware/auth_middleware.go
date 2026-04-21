package middleware

import (
	"backend/internal/config"
	"backend/internal/models"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func Protect() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Not authorized, no token"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Not authorized, invalid token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token claims"})
			c.Abort()
			return
		}

		userIDStr, ok := claims["id"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token payload"})
			c.Abort()
			return
		}

		objID, _ := primitive.ObjectIDFromHex(userIDStr)

		var user models.User
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if config.IsDBConnected {
			err = config.DB.Collection("users").FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"message": "User not found"})
				c.Abort()
				return
			}
		} else {
			// Demo Mode: Check cache
			var exists bool
			user, exists = config.GetUserFromCache(userIDStr)
			if !exists {
				log.Println("⚠️  User not found in cache, using generic demo fallback")
				user = models.User{
					ID:       objID,
					Fullname: "Demo User",
					Username: "demo",
					Email:    "demo@example.com",
					Role:     "user",
				}
			}
		}

		c.Set("user", user)
		c.Next()
	}
}
