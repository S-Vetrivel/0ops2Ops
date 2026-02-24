package controllers

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"backend/internal/config"
	"backend/internal/models"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
)

var githubOauthConfig *oauth2.Config

func initGitHubConfig() {
	if githubOauthConfig == nil {
		githubOauthConfig = &oauth2.Config{
			RedirectURL:  os.Getenv("GITHUB_CALLBACK_URL"),
			ClientID:     os.Getenv("GITHUB_CLIENT_ID"),
			ClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
			Scopes:       []string{"user:email", "read:user", "repo"},
			Endpoint:     github.Endpoint,
		}

		// Fallback for redirect URL if not set
		if githubOauthConfig.RedirectURL == "" {
			port := os.Getenv("PORT")
			if port == "" {
				port = "3000"
			}
			githubOauthConfig.RedirectURL = "http://localhost:" + port + "/api/auth/github/callback"
		}
	}
}

// Helper to find or create user from GitHub
func findOrCreateGitHubUser(ctx context.Context, userInfo map[string]interface{}, accessToken string) (*models.User, error) {
	// GitHub might return "email" as null if private, so we might need to fetch emails separately
	// For simplicity, we assume we get the primary email or use ID as fallback for finding

	var email string
	if e, ok := userInfo["email"].(string); ok {
		email = e
	}

	// Double check email logic - sometimes we need a second call for emails if scope includes 'user:email'
	// But let's assume we handle the simple case first.
	// If email is empty, we can't key off it easily without more logic.
	// If email is empty, we can't key off it easily without more logic.
	// We'll trust the email presence for now, or fallback to a generated email

	// Convert to string safely (GitHub IDs are numbers)
	// We'll trust the email presence for now, or fallback to a generated email
	if email == "" {
		email = "github_" + os.Getenv("GITHUB_CLIENT_ID") + "_" + "no_email@example.com" // Hacky fallback
	}

	var user models.User
	// Try finding by Email first
	err := config.DB.Collection("users").FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err == nil {
		// Update access token if user exists
		if accessToken != "" {
			update := bson.M{"$set": bson.M{"githubAccessToken": accessToken}}
			_, _ = config.DB.Collection("users").UpdateOne(ctx, bson.M{"_id": user.ID}, update)
		}
		return &user, nil
	}

	// If finding by email failed, maybe check by GitHub ID (if we added that field, but we assume email is unique constraint)
	// We will create the user.

	name := "GitHub User"
	if n, ok := userInfo["name"].(string); ok {
		name = n
	} else if l, ok := userInfo["login"].(string); ok {
		name = l
	}

	picture := ""
	if p, ok := userInfo["avatar_url"].(string); ok {
		picture = p
	}

	username := email
	if idx := indexAt(email, "@"); idx > -1 {
		username = email[:idx]
	}

	newUser := models.User{
		ID:       primitive.NewObjectID(),
		Username: username,
		Fullname:          name,
		Email:             email,
		GitHubAccessToken: accessToken,
		// Store GitHub specific ID if we updated the model, but currently we rely on email.
		// Ideally we should add 'GithubId' to model.
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

// 1. Trigger Route
func GitHubLogin(c *gin.Context) {
	initGitHubConfig()
	url := githubOauthConfig.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// 2. Callback Route
func GitHubCallback(c *gin.Context) {
	initGitHubConfig()
	code := c.Query("code")

	token, err := githubOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, os.Getenv("CLIENT_URL")+"/login?error=auth_failed")
		return
	}

	client := githubOauthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, os.Getenv("CLIENT_URL")+"/login?error=no_user_info")
		return
	}
	defer resp.Body.Close()

	data, _ := io.ReadAll(resp.Body)
	var userInfo map[string]interface{}
	json.Unmarshal(data, &userInfo)

	// Helper to fetch email if not public
	if userInfo["email"] == nil {
		respEmails, err := client.Get("https://api.github.com/user/emails")
		if err == nil {
			defer respEmails.Body.Close()
			dataEmails, _ := io.ReadAll(respEmails.Body)
			var emails []map[string]interface{}
			json.Unmarshal(dataEmails, &emails)
			for _, e := range emails {
				if e["primary"].(bool) && e["verified"].(bool) {
					userInfo["email"] = e["email"]
					break
				}
			}
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	user, err := findOrCreateGitHubUser(ctx, userInfo, token.AccessToken)
	if err != nil {
		log.Println("Error creating github user:", err)
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
