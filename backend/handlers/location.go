package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/nab-cat/GIS-APP/backend/config"
	"github.com/nab-cat/GIS-APP/backend/models"
)

func GetLocations(w http.ResponseWriter, r *http.Request) {
	var locations []models.Location
	config.DB.Find(&locations)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(locations)
}

func CreateLocation(w http.ResponseWriter, r *http.Request) {
	var location models.Location
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	if err := config.DB.Create(&location).Error; err != nil {
		http.Error(w, "Failed to create location", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(location)
}

func UpdateLocation(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		http.Error(w, "Invalid location ID", http.StatusBadRequest)
		return
	}
	var location models.Location
	if err := config.DB.First(&location, id).Error; err != nil {
		http.Error(w, "Location not found", http.StatusNotFound)
		return
	}
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	config.DB.Save(&location)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(location)
}

func DeleteLocation(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		http.Error(w, "Invalid location ID", http.StatusBadRequest)
		return
	}
	if err := config.DB.Delete(&models.Location{}, id).Error; err != nil {
		http.Error(w, "Failed to delete location", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
