package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"PortfolioAPI/database"
	"PortfolioAPI/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func getCDNURL() string {
	cdnURL := os.Getenv("CDN_URL")
	if cdnURL == "" {
		port := os.Getenv("PORT")
		if port == "" {
			port = "8080"
		}
		cdnURL = "http://localhost:" + port + "/cdn"
	}
	return strings.TrimSuffix(cdnURL, "/")
}

func addCDNPrefix(user *models.User) {
	if user.Avatar != "" && !strings.HasPrefix(user.Avatar, "http") {
		user.Avatar = getCDNURL() + user.Avatar
	}
}

func GetUsers(c *gin.Context) {
	users := []models.User{}
	database.DB.Find(&users)
	for i := range users {
		addCDNPrefix(&users[i])
	}
	c.JSON(http.StatusOK, users)
}

func GetUser(c *gin.Context) {
	var user models.User
	if err := database.DB.Preload("Blogs").First(&user, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	addCDNPrefix(&user)
	c.JSON(http.StatusOK, user)
}

func CreateUser(c *gin.Context) {
	name := c.PostForm("name")
	email := c.PostForm("email")
	avatarURL := c.PostForm("avatar_url")

	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}

	userID := uuid.New().String()

	user := models.User{
		ID:    userID,
		Name:  name,
		Email: email,
	}

	// Avatar URL gesetzt? Dann verwenden
	if avatarURL != "" {
		user.Avatar = avatarURL
	}

	// Bild hochgeladen?
	file, err := c.FormFile("avatar")
	if err == nil {
		// User Ordner erstellen
		userDir := filepath.Join("public", "users", userID)
		if err := os.MkdirAll(userDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user directory"})
			return
		}

		// Dateiendung beibehalten
		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("avatar%s", ext)
		filePath := filepath.Join(userDir, filename)

		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save avatar"})
			return
		}

		user.Avatar = fmt.Sprintf("/users/%s/%s", userID, filename)
	}

	if err := database.DB.Create(&user).Error; err != nil {
		// Bei Fehler: Ordner wieder löschen falls erstellt
		os.RemoveAll(filepath.Join("public", "users", userID))
		if strings.Contains(err.Error(), "Duplicate entry") || strings.Contains(err.Error(), "UNIQUE constraint") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		}
		return
	}

	addCDNPrefix(&user)
	c.JSON(http.StatusCreated, user)
}

func UpdateUser(c *gin.Context) {
	var user models.User
	if err := database.DB.First(&user, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	name := c.PostForm("name")
	email := c.PostForm("email")
	avatarURL := c.PostForm("avatar_url")

	if name != "" {
		user.Name = name
	}
	if email != "" {
		user.Email = email
	}
	if avatarURL != "" {
		user.Avatar = avatarURL
	}

	// Bild hochgeladen?
	file, err := c.FormFile("avatar")
	if err == nil {
		// User Ordner erstellen
		userDir := filepath.Join("public", "users", user.ID)
		if err := os.MkdirAll(userDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user directory"})
			return
		}

		// Alte Avatar-Dateien löschen
		matches, _ := filepath.Glob(filepath.Join(userDir, "avatar.*"))
		for _, match := range matches {
			os.Remove(match)
		}

		// Dateiendung beibehalten
		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("avatar%s", ext)
		filePath := filepath.Join(userDir, filename)

		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save avatar"})
			return
		}

		user.Avatar = fmt.Sprintf("/users/%s/%s", user.ID, filename)
	}

	if err := database.DB.Save(&user).Error; err != nil {
		if strings.Contains(err.Error(), "Duplicate entry") || strings.Contains(err.Error(), "UNIQUE constraint") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		}
		return
	}

	addCDNPrefix(&user)
	c.JSON(http.StatusOK, user)
}

func DeleteUser(c *gin.Context) {
	var user models.User
	if err := database.DB.First(&user, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Erst die Verknüpfungen in blog_authors löschen
	if err := database.DB.Exec("DELETE FROM blog_authors WHERE user_id = ?", user.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user blog relations"})
		return
	}

	// Verknüpfungen in project_authors löschen
	if err := database.DB.Exec("DELETE FROM project_authors WHERE user_id = ?", user.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user project relations"})
		return
	}

	// User Ordner löschen falls vorhanden
	userDir := filepath.Join("public", "users", user.ID)
	os.RemoveAll(userDir)

	if err := database.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}
