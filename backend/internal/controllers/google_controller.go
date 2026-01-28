package controllers

import (
	"backend/internal/config"
	"backend/internal/models"
	"backend/internal/utils"
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/idtoken"
)

var googleOauthConfig *oauth2.Config

func initGoogleConfig() {
	if googleOauthConfig == nil {
		googleOauthConfig = &oauth2.Config{
			RedirectURL:  os.Getenv("GOOGLE_CALLBACK_URL"), // e.g. http://localhost:3000/api/auth/google/callback
			ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
			ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
			Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
			Endpoint:     google.Endpoint,
		}
		// If CALLBACK_URL not set, try to infer or fallback
		if googleOauthConfig.RedirectURL == "" {
			// Legacy might use passport default, we need explicit
			port := os.Getenv("PORT")
			if port == "" {
				port = "3000"
			}
			googleOauthConfig.RedirectURL = "http://localhost:" + port + "/api/auth/google/callback"
		}
	}
}

// Helper to find or create user
func findOrCreateGoogleUser(ctx context.Context, payload *idtoken.Payload, oauthUser map[string]interface{}) (*models.User, error) {
	email := ""
	if payload != nil {
		email = payload.Claims["email"].(string)
	} else if oauthUser != nil {
		email = oauthUser["email"].(string)
	}

	if email == "" {
		return nil, http.ErrNoLocation // Just an error
	}

	var user models.User
	err := config.DB.Collection("users").FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err == nil {
		return &user, nil
	}

	// Create User
	name := ""
	picture := ""
	googleId := ""

	if payload != nil {
		name = payload.Claims["name"].(string)
		picture = payload.Claims["picture"].(string)
		googleId = payload.Subject
	} else if oauthUser != nil {
		name = oauthUser["name"].(string)
		picture = oauthUser["picture"].(string)
		googleId = oauthUser["id"].(string)
	}

	// Generate username from email
	username := email
	if idx := indexAt(email, "@"); idx > -1 {
		username = email[:idx]
	}

	newUser := models.User{
		ID:             primitive.NewObjectID(),
		Username:       username,
		Fullname:       name,
		Email:          email,
		GoogleId:       googleId,
		ProfilePicture: picture,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
		Role:           "user",
	}

	_, err = config.DB.Collection("users").InsertOne(ctx, newUser)
	if err != nil {
		return nil, err
	}
	return &newUser, nil
}

func indexAt(s, sep string) int {
	for i := 0; i < len(s); i++ {
		if string(s[i]) == sep {
			return i
		}
	}
	return -1
}

// 1. Trigger Route
func GoogleLogin(c *gin.Context) {
	initGoogleConfig()

	// Debug Logging
	clientID := googleOauthConfig.ClientID
	log.Printf("DEBUG: Google Login Triggered")
	log.Printf("DEBUG: Client ID loaded: '%s'", clientID)
	log.Printf("DEBUG: Callback URL: '%s'", googleOauthConfig.RedirectURL)

	url := googleOauthConfig.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// 2. Callback Route
func GoogleCallback(c *gin.Context) {
	initGoogleConfig()
	code := c.Query("code")

	token, err := googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, os.Getenv("CLIENT_URL")+"/login?error=auth_failed")
		return
	}

	client := googleOauthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, os.Getenv("CLIENT_URL")+"/login?error=no_user_info")
		return
	}
	defer resp.Body.Close()

	// Read body
	data, _ := io.ReadAll(resp.Body)
	var userInfo map[string]interface{}
	json.Unmarshal(data, &userInfo)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	user, err := findOrCreateGoogleUser(ctx, nil, userInfo)
	if err != nil {
		log.Println("Error creating google user:", err)
		c.Redirect(http.StatusTemporaryRedirect, os.Getenv("CLIENT_URL")+"/login?error=db_error")
		return
	}

	utils.GenerateTokenAndSetCookie(c, user.ID)

	clientUrl := os.Getenv("CLIENT_URL")
	if clientUrl == "" {
		clientUrl = "http://localhost:5173"
	}
	c.Redirect(http.StatusTemporaryRedirect, clientUrl)
}

// 3. One Tap Route
func GoogleOneTap(c *gin.Context) {
	var body struct {
		Token string `json:"token"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid body"})
		return
	}

	// Verify ID Token
	ctx := context.Background()
	payload, err := idtoken.Validate(ctx, body.Token, os.Getenv("GOOGLE_CLIENT_ID"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Invalid Google Token"})
		return
	}

	// find or create
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	user, err := findOrCreateGoogleUser(ctx, payload, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Database error"})
		return
	}

	utils.GenerateTokenAndSetCookie(c, user.ID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user":    user, // Map appropriately if needed, but legacy returns whole user
		"message": "Google One Tap Login Successful",
	})
}
