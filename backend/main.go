package main

import (
	"log"
	"net/http"

	"github.com/nab-cat/GIS-APP/backend/config"
	"github.com/nab-cat/GIS-APP/backend/models"
	"github.com/nab-cat/GIS-APP/backend/routes"
)

func main() {
	config.ConnectDatabase()

	// Auto-migrate the User model
	config.DB.AutoMigrate(&models.User{})

	router := routes.RegisterRoutes()
	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
