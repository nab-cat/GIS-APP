package handlers

import (
	"net/http"
	"strconv"

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

func GetNearbySpots(c *gin.Context) {
	lngStr := c.Query("lng")
	latStr := c.Query("lat")
	distStr := c.Query("distance")

	lng, err1 := strconv.ParseFloat(lngStr, 64)
	lat, err2 := strconv.ParseFloat(latStr, 64)
	distance, err3 := strconv.Atoi(distStr)

	if err1 != nil || err2 != nil || err3 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	type SpotWithDistance struct {
		models.Spot
		Distance float64 `json:"distance"`
	}

	var spotsWithDist []SpotWithDistance

	err := config.DB.Raw(`
		SELECT *, ST_Distance(
			location::geography,
			ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography
		) AS distance
		FROM spots
		WHERE ST_DWithin(
			location::geography,
			ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
			?
		)
		ORDER BY distance
	`, lng, lat, lng, lat, distance).Scan(&spotsWithDist).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, spotsWithDist)
}
