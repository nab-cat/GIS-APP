package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nab-cat/GIS-APP/backend/config"
	"github.com/nab-cat/GIS-APP/backend/models"
)

func GetSpots(c *gin.Context) {
	var spots []models.Spot
	if err := config.DB.Find(&spots).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get spots"})
		return
	}
	c.JSON(http.StatusOK, spots)
}

func CreateSpot(c *gin.Context) {
	var spot models.Spot
	if err := c.ShouldBindJSON(&spot); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	if err := config.DB.Create(&spot).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create spot"})
		return
	}

	c.JSON(http.StatusCreated, spot)
}

func UpdateSpot(c *gin.Context) {
	id := c.Param("id")
	var spot models.Spot

	if err := config.DB.First(&spot, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Spot not found"})
		return
	}

	if err := c.ShouldBindJSON(&spot); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	config.DB.Save(&spot)
	c.JSON(http.StatusOK, spot)
}

func DeleteSpot(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Spot{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete spot"})
		return
	}
	c.Status(http.StatusNoContent)
}
