package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/nab-cat/GIS-APP/backend/config"
	"github.com/nab-cat/GIS-APP/backend/models"
	"github.com/nab-cat/GIS-APP/backend/routes"
)

func main() {
	// Connect to DB and migrate
	config.ConnectDatabase()
	config.DB.AutoMigrate(&models.User{}, &models.Spot{})

	// Initialize Gin router
	router := routes.RegisterRoutes()

	// Configure CORS for Gin
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
	}))

	log.Println("Server running on http://localhost:8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to run server:", err)
	}
}
