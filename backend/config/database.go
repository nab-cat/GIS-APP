package config

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Declare a global DB connection
var DB *gorm.DB

// ConnectDatabase initializes the database connection
func ConnectDatabase() {
	dsn := "host=localhost port=5432 user=postgres password=1212 dbname=gis_app sslmode=disable"

	// Open a connection to PostgreSQL using GORM
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	// Assign the connection to the global DB
	DB = db
	fmt.Println("✅ Connected to PostgreSQL database")
}
