package routes

import (
	"backend/internal/controllers"
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
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

		// Profile RoutesMatches /api/profile
		// profile := api.Group("/profile") // Profile routes are now part of the protected group
		// {
		// 	profile.PUT("/info", middleware.Protect(), controllers.PersonalInfo) // Moved to protected group
		// 	profile.POST("/profile-image", middleware.Protect(), controllers.UploadProfilePicture) // Moved to protected group
		// }

		protected := api.Group("") // This group will inherit the /api prefix
		protected.Use(middleware.Protect())
		{
			// Profile routes moved to protected group
			protected.PUT("/profile/info", controllers.PersonalInfo)
		}
	}
}
