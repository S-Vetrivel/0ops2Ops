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
			
			auth.GET("/google", controllers.GoogleLogin)
			auth.GET("/google/callback", controllers.GoogleCallback)
			auth.POST("/google/onetap", controllers.GoogleOneTap)
		}

		// Profile RoutesMatches /api/profile
		profile := api.Group("/profile")
		{
			profile.PUT("/info", middleware.Protect(), controllers.PersonalInfo)
			profile.POST("/profile-image", middleware.Protect(), controllers.UploadProfilePicture)
		}
	}
}
