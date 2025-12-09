package handlers

import (
	"net/http"

	"PortfolioAPI/database"
	"PortfolioAPI/models"

	"github.com/gin-gonic/gin"
)

func GetCategories(c *gin.Context) {
	categories := []models.Category{}
	database.DB.Order("name ASC").Find(&categories)
	c.JSON(http.StatusOK, categories)
}

func GetCategory(c *gin.Context) {
	var category models.Category
	if err := database.DB.First(&category, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}
	c.JSON(http.StatusOK, category)
}

func CreateCategory(c *gin.Context) {
	name := c.PostForm("name")
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}

	category := models.Category{
		Name: name,
	}

	if err := database.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	c.JSON(http.StatusCreated, category)
}

func UpdateCategory(c *gin.Context) {
	var category models.Category
	if err := database.DB.First(&category, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	name := c.PostForm("name")
	if name != "" {
		category.Name = name
	}

	if err := database.DB.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category"})
		return
	}

	c.JSON(http.StatusOK, category)
}

func DeleteCategory(c *gin.Context) {
	var category models.Category
	if err := database.DB.First(&category, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	// Erst die Verknüpfungen in project_categories löschen
	if err := database.DB.Exec("DELETE FROM project_categories WHERE category_id = ?", category.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category relations"})
		return
	}

	if err := database.DB.Delete(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted"})
}
