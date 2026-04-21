package routes

import (
	"backend/internal/controllers"
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// 1. Install global IDS Traffic Logger
	r.Use(middleware.TrafficLogger())

	api := r.Group("/api")
	{
		// Auth Routes
		auth := api.Group("/auth")
		{
			auth.POST("/signup", controllers.Signup)
			auth.POST("/login", controllers.Login)
			auth.GET("/logout", controllers.Logout)
			auth.GET("/me", middleware.Protect(), controllers.Me)
			auth.POST("/reset-password", controllers.ResetPassword)
			// Google Auth
			auth.GET("/google", controllers.GoogleLogin)
			auth.GET("/google/callback", controllers.GoogleCallback)
			auth.POST("/google/one-tap", controllers.GoogleOneTap)

			// GitHub Auth
			auth.GET("/github", controllers.GitHubLogin)
			auth.GET("/github/callback", controllers.GitHubCallback)
		}

		protected := api.Group("") // This group will inherit the /api prefix
		protected.Use(middleware.Protect())
		{
			// Profile routes moved to protected group
			protected.PUT("/profile/info", controllers.PersonalInfo)
			protected.POST("/profile/profile-image", controllers.UploadProfilePicture)
			protected.GET("/repos", controllers.ListRepos)
			protected.GET("/deploy", controllers.DeployRepo)
			protected.GET("/services", controllers.ListServices)
			protected.POST("/services/:id/:action", controllers.ServiceAction)
			protected.GET("/firewall", controllers.GetFirewallRules)
			protected.POST("/firewall", controllers.MutateFirewall)
			// Admin/Dashboard Logs
			protected.GET("/logs", controllers.GetLogs)

			// AI Chat route
			protected.POST("/chat", controllers.HandleChat)
		}
	}
}
