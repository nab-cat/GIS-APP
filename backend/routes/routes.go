package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/nab-cat/GIS-APP/backend/handlers"
)

// RegisterRoutes registers all routes on the given Gin router.
func RegisterRoutes(router *gin.Engine) {
	// Users
	router.GET("/users", handlers.GetUsers)
	router.POST("/users", handlers.CreateUser)
	router.PUT("/users/:id", handlers.UpdateUser)
	router.DELETE("/users/:id", handlers.DeleteUser)

	// Spots
	router.GET("/spots", handlers.GetSpots)
	router.POST("/spots", handlers.CreateSpot)
	router.PUT("/spots/:id", handlers.UpdateSpot)
	router.DELETE("/spots/:id", handlers.DeleteSpot)
	router.GET("/spots/nearby", handlers.GetNearbySpots)
}
