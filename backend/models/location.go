package models

type Location struct {
	ID        uint    `gorm:"primaryKey"`
	Name      string  `json:"name"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}
