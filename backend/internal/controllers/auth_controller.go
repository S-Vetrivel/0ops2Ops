package controllers

import (
	"backend/internal/config"
	"backend/internal/models"
	"backend/internal/utils"
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func Signup(c *gin.Context) {
	var body struct {
		Fullname        string `json:"fullname"`
		Username        string `json:"username"`
		Email           string `json:"email"`
		Password        string `json:"password"`
		ConfirmPassword string `json:"confirmPassword"`
		Phone           string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	// Fallback logic
	if body.Username == "" && body.Email != "" {
		parts := strings.Split(body.Email, "@")
		if len(parts) > 0 {
			body.Username = parts[0]
		}
	}
	if body.Fullname == "" {
		body.Fullname = "User"
	}

	if body.Email == "" || body.Password == "" || body.Username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Missing required fields"})
		return
	}

	if body.Password != body.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Passwords do not match"})
		return
	}

	if !utils.IsPasswordStrong(body.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Password must be at least 8 chars long and include uppercase, lowercase, number, and symbol."})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if config.IsDBConnected {
		// Check duplicate email
		count, err := config.DB.Collection("users").CountDocuments(ctx, bson.M{"email": body.Email})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}
		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"message": "User already exists"})
			return
		}
	} else {
		// Demo Mode: Check cache for duplicate
		if _, exists := config.GetUserByEmailFromCache(body.Email); exists {
			c.JSON(http.StatusBadRequest, gin.H{"message": "User already exists (Demo Cache)"})
			return
		}
	}

	hashedPassword, err := utils.HashPassword(body.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error hashing password"})
		return
	}

	newUser := models.User{
		ID:        primitive.NewObjectID(),
		Fullname:  body.Fullname,
		Username:  body.Username,
		Email:     body.Email,
		Password:  hashedPassword,
		Phone:     body.Phone,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Role:      "user",
	}

	if config.IsDBConnected {
		_, err = config.DB.Collection("users").InsertOne(ctx, newUser)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}
	} else {
		// Demo Mode: Save to cache
		config.RegisterUserInCache(newUser.ID.Hex(), newUser)
	}

	utils.GenerateTokenAndSetCookie(c, newUser.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Signup successful",
		"user": gin.H{
			"id":       newUser.ID.Hex(), // Map _id to id
			"email":    newUser.Email,
			"fullname": newUser.Fullname,
			"username": newUser.Username,
		},
	})
}

func Login(c *gin.Context) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	if body.Email == "" || body.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Missing fields"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	if config.IsDBConnected {
		err := config.DB.Collection("users").FindOne(ctx, bson.M{"email": body.Email}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
			return
		}
	} else {
		// Demo Mode: Check cache
		var exists bool
		user, exists = config.GetUserByEmailFromCache(body.Email)
		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"message": "User not found in Demo Cache"})
			return
		}
	}

	if !utils.CheckPasswordHash(body.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid credentials"})
		return
	}

	utils.GenerateTokenAndSetCookie(c, user.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user": gin.H{
			"id":       user.ID.Hex(), // Map _id to id
			"email":    user.Email,
			"fullname": user.Fullname,
			"username": user.Username,
		},
	})
}

func Logout(c *gin.Context) {
	c.SetCookie("token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func Me(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Not authorized"})
		return
	}

	// user is already a models.User struct (which has tags for JSON)
	// We need to return { "success": true, "user": user }

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user":    user,
	})
}

func ResetPassword(c *gin.Context) {
	// Basic placeholder to match legacy routes presence
	// Legacy implementation doesn't actually send email yet (TODO comments in legacy)
	// So we just return the success response if user exists

	var body struct {
		Email string `json:"email"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || body.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Email is required"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User
	err := config.DB.Collection("users").FindOne(ctx, bson.M{"email": body.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "No account found with this email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password reset instructions sent to email",
		"user": gin.H{
			"id":       user.ID.Hex(),
			"fullname": user.Fullname,
			"username": user.Username,
			"email":    user.Email,
			"phone":    user.Phone,
		},
	})
}
