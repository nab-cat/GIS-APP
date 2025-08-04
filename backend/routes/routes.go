package routes

import (
	"github.com/gorilla/mux"
	"github.com/nab-cat/GIS-APP/backend/handlers"
)

func RegisterRoutes() *mux.Router {
	router := mux.NewRouter()

	// Users
	router.HandleFunc("/users", handlers.GetUsers).Methods("GET")
	router.HandleFunc("/users", handlers.CreateUser).Methods("POST")
	router.HandleFunc("/users/{id}", handlers.UpdateUser).Methods("PUT")
	router.HandleFunc("/users/{id}", handlers.DeleteUser).Methods("DELETE")

	// Locations
	router.HandleFunc("/locations", handlers.GetLocations).Methods("GET")
	router.HandleFunc("/locations", handlers.CreateLocation).Methods("POST")
	router.HandleFunc("/locations/{id}", handlers.UpdateLocation).Methods("PUT")
	router.HandleFunc("/locations/{id}", handlers.DeleteLocation).Methods("DELETE")

	return router
}
