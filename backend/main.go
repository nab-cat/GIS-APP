package main

import (
	"log"
	"net/http"

	"github.com/nab-cat/GIS-APP/backend/config"
	"github.com/nab-cat/GIS-APP/backend/models"
	"github.com/nab-cat/GIS-APP/backend/routes"
	"github.com/rs/cors"
)

func main() {
	config.ConnectDatabase()
	config.DB.AutoMigrate(&models.User{}, &models.Location{})

	router := routes.RegisterRoutes()

	// CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // React frontend
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
	})

	handler := c.Handler(router)

	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
