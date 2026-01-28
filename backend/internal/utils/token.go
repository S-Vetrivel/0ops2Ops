package utils

import (
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GenerateTokenAndSetCookie(c *gin.Context, userId primitive.ObjectID) string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Println("Warning: JWT_SECRET not set in env")
	}

	// 1. Generate Token
	claims := jwt.MapClaims{
		"id":  userId.Hex(),
		"exp": time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		log.Println("Error signing token:", err)
		return ""
	}

	// 2. Set Cookie
	c.SetCookie("token", tokenString, 3600*24*7, "/", "", false, true)
	// path="/", domain="", minAge=7days, secure=false (dev), httpOnly=true
	// Note: secure should be true in prod, checking NODE_ENV would be better but keeping simple for now

	return tokenString
}
