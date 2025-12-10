package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"PortfolioAPI/database"
	"PortfolioAPI/models"

	"github.com/gin-gonic/gin"
)

func addProjectCDNPrefix(project *models.Project) {
	if project.Image != "" && !strings.HasPrefix(project.Image, "http") {
		project.Image = getCDNURL() + project.Image
	}
	for i := range project.Authors {
		if project.Authors[i].Avatar != "" && !strings.HasPrefix(project.Authors[i].Avatar, "http") {
			project.Authors[i].Avatar = getCDNURL() + project.Authors[i].Avatar
		}
	}
	for i := range project.Languages {
		if project.Languages[i].Icon != "" && !strings.HasPrefix(project.Languages[i].Icon, "http") {
			project.Languages[i].Icon = getCDNURL() + project.Languages[i].Icon
		}
	}
}

func GetProjects(c *gin.Context) {
	projects := []models.Project{}
	database.DB.Preload("Languages").Preload("Authors").Find(&projects)
	for i := range projects {
		addProjectCDNPrefix(&projects[i])
	}
	c.JSON(http.StatusOK, projects)
}

func GetProject(c *gin.Context) {
	var project models.Project
	if err := database.DB.Preload("Languages").Preload("Authors").First(&project, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}
	addProjectCDNPrefix(&project)
	c.JSON(http.StatusOK, project)
}

func CreateProject(c *gin.Context) {
	title := c.PostForm("title")
	description := c.PostForm("description")
	imageURL := c.PostForm("image")
	link := c.PostForm("link")
	createdAtStr := c.PostForm("created_at")
	languageIDsStr := c.PostForm("language_ids")
	authorIDsStr := c.PostForm("author_ids")

	if title == "" || description == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title and description are required"})
		return
	}

	project := models.Project{
		Title:       title,
		Description: description,
		Image:       imageURL,
		Link:        link,
	}

	if createdAtStr != "" {
		if t, err := time.Parse(time.RFC3339, createdAtStr); err == nil {
			project.CreatedAt = t
		} else if t, err := time.Parse("2006-01-02", createdAtStr); err == nil {
			project.CreatedAt = t
		}
	}

	if languageIDsStr != "" {
		languageIDs := strings.Split(languageIDsStr, ",")
		var languages []models.Language
		if err := database.DB.Where("id IN ?", languageIDs).Find(&languages).Error; err == nil && len(languages) > 0 {
			project.Languages = languages
		}
	}

	if authorIDsStr != "" {
		authorIDs := strings.Split(authorIDsStr, ",")
		var authors []models.User
		if err := database.DB.Where("id IN ?", authorIDs).Find(&authors).Error; err == nil && len(authors) > 0 {
			project.Authors = authors
		}
	}

	database.DB.Create(&project)

	// Bild hochgeladen?
	file, err := c.FormFile("image_file")
	if err == nil {
		projectDir := filepath.Join("public", "projects", project.ID)
		if err := os.MkdirAll(projectDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project directory"})
			return
		}

		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("image%s", ext)
		filePath := filepath.Join(projectDir, filename)

		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}

		project.Image = fmt.Sprintf("/projects/%s/%s", project.ID, filename)
		database.DB.Save(&project)
	}

	database.DB.Preload("Languages").Preload("Authors").First(&project, "id = ?", project.ID)
	addProjectCDNPrefix(&project)
	c.JSON(http.StatusCreated, project)
}

func UpdateProject(c *gin.Context) {
	var project models.Project
	if err := database.DB.First(&project, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	title := c.PostForm("title")
	description := c.PostForm("description")
	imageURL := c.PostForm("image")
	link := c.PostForm("link")
	createdAtStr := c.PostForm("created_at")
	languageIDsStr := c.PostForm("language_ids")
	authorIDsStr := c.PostForm("author_ids")

	if title != "" {
		project.Title = title
	}
	if description != "" {
		project.Description = description
	}
	if imageURL != "" {
		project.Image = imageURL
	}
	if link != "" {
		project.Link = link
	}
	if createdAtStr != "" {
		if t, err := time.Parse(time.RFC3339, createdAtStr); err == nil {
			project.CreatedAt = t
		} else if t, err := time.Parse("2006-01-02", createdAtStr); err == nil {
			project.CreatedAt = t
		}
	}

	// Bild hochgeladen?
	file, err := c.FormFile("image_file")
	if err == nil {
		projectDir := filepath.Join("public", "projects", project.ID)
		if err := os.MkdirAll(projectDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project directory"})
			return
		}

		// Alte Bilder löschen
		matches, _ := filepath.Glob(filepath.Join(projectDir, "image.*"))
		for _, match := range matches {
			os.Remove(match)
		}

		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("image%s", ext)
		filePath := filepath.Join(projectDir, filename)

		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}

		project.Image = fmt.Sprintf("/projects/%s/%s", project.ID, filename)
	}

	// Language IDs verarbeiten
	if languageIDsStr != "" {
		languageIDs := strings.Split(languageIDsStr, ",")
		var languages []models.Language
		database.DB.Where("id IN ?", languageIDs).Find(&languages)
		database.DB.Model(&project).Association("Languages").Replace(languages)
	}

	// Author IDs verarbeiten
	if authorIDsStr != "" {
		authorIDs := strings.Split(authorIDsStr, ",")
		var authors []models.User
		database.DB.Where("id IN ?", authorIDs).Find(&authors)
		database.DB.Model(&project).Association("Authors").Replace(authors)
	}

	database.DB.Save(&project)
	database.DB.Preload("Languages").Preload("Authors").First(&project, "id = ?", project.ID)
	addProjectCDNPrefix(&project)
	c.JSON(http.StatusOK, project)
}

func DeleteProject(c *gin.Context) {
	var project models.Project
	if err := database.DB.First(&project, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	projectID := project.ID

	// Transaktion: Erst Verknüpfungen, dann Project löschen
	tx := database.DB.Begin()

	if err := tx.Exec("DELETE FROM project_languages WHERE project_id = ?", projectID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project languages"})
		return
	}

	if err := tx.Exec("DELETE FROM project_authors WHERE project_id = ?", projectID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project authors"})
		return
	}

	if err := tx.Delete(&project).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project"})
		return
	}

	tx.Commit()

	// Project-Bilder Ordner löschen
	os.RemoveAll(filepath.Join("public", "projects", projectID))

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted"})
}
