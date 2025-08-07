package models

import (
	"time"

	"github.com/google/uuid"
)

// Spot represents both facilities and tourism places
type Spot struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	Category    string    `gorm:"type:varchar(20);not null" json:"category"`
	Type        string    `gorm:"type:varchar(50);not null" json:"type"`
	Latitude    float64   `gorm:"not null" json:"latitude"`
	Longitude   float64   `gorm:"not null" json:"longitude"`
	Address     string    `json:"address"`
	ImageURL    string    `json:"image_url"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Ignore location in Go, it's managed by PostGIS trigger
	// Location ??? omit or use raw string/[]byte if really needed
}
