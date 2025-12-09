package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"PortfolioAPI/database"
	"PortfolioAPI/models"

	"github.com/gin-gonic/gin"
)

func GetLanguages(c *gin.Context) {
	languages := []models.Language{}
	database.DB.Find(&languages)
	c.JSON(http.StatusOK, languages)
}

func GetLanguage(c *gin.Context) {
	var language models.Language
	if err := database.DB.First(&language, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Language not found"})
		return
	}
	c.JSON(http.StatusOK, language)
}

func CreateLanguage(c *gin.Context) {
	name := c.PostForm("name")
	iconURL := c.PostForm("icon")

	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}

	language := models.Language{
		Name: name,
		Icon: iconURL,
	}

	database.DB.Create(&language)

	// Icon hochgeladen?
	file, err := c.FormFile("icon_file")
	if err == nil {
		langDir := filepath.Join("public", "languages", language.ID)
		if err := os.MkdirAll(langDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create language directory"})
			return
		}

		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("icon%s", ext)
		filePath := filepath.Join(langDir, filename)

		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save icon"})
			return
		}

		language.Icon = fmt.Sprintf("%s/languages/%s/%s", getCDNURL(), language.ID, filename)
		database.DB.Save(&language)
	}

	c.JSON(http.StatusCreated, language)
}

func UpdateLanguage(c *gin.Context) {
	var language models.Language
	if err := database.DB.First(&language, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Language not found"})
		return
	}

	name := c.PostForm("name")
	iconURL := c.PostForm("icon")

	if name != "" {
		language.Name = name
	}
	if iconURL != "" {
		language.Icon = iconURL
	}

	// Icon hochgeladen?
	file, err := c.FormFile("icon_file")
	if err == nil {
		langDir := filepath.Join("public", "languages", language.ID)
		if err := os.MkdirAll(langDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create language directory"})
			return
		}

		// Alte Icons löschen
		matches, _ := filepath.Glob(filepath.Join(langDir, "icon.*"))
		for _, match := range matches {
			os.Remove(match)
		}

		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("icon%s", ext)
		filePath := filepath.Join(langDir, filename)

		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save icon"})
			return
		}

		language.Icon = fmt.Sprintf("%s/languages/%s/%s", getCDNURL(), language.ID, filename)
	}

	database.DB.Save(&language)
	c.JSON(http.StatusOK, language)
}

func DeleteLanguage(c *gin.Context) {
	var language models.Language
	if err := database.DB.First(&language, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Language not found"})
		return
	}

	langID := language.ID

	// Transaktion: Erst Verknüpfungen, dann Language löschen
	tx := database.DB.Begin()

	if err := tx.Exec("DELETE FROM project_languages WHERE language_id = ?", langID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete language projects"})
		return
	}

	if err := tx.Delete(&language).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete language"})
		return
	}

	tx.Commit()

	// Icon Ordner löschen
	os.RemoveAll(filepath.Join("public", "languages", langID))

	c.JSON(http.StatusOK, gin.H{"message": "Language deleted"})
}
