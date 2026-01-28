package main

import (
	"backend/internal/config"
	"backend/internal/routes"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system env or defaults")
	}

	// Connect to Mongo
	config.ConnectMongo()

	r := gin.Default()

	// CORS Config
	clientURL := os.Getenv("CLIENT_URL")
	if clientURL == "" {
		clientURL = "http://localhost:5173"
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{clientURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Cookie"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Routes
	r.Static("/uploads", "./public/uploads")
	routes.SetupRoutes(r)

	// Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	
	log.Printf("☑️  Go server running on http://127.0.0.1:%s", port)
	r.Run(":" + port)
}
