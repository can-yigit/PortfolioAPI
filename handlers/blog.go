package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"PortfolioAPI/database"
	"PortfolioAPI/models"

	"github.com/gin-gonic/gin"
)

func GetBlogs(c *gin.Context) {
	blogs := []models.Blog{}
	categoryID := c.Query("category_id")

	query := database.DB.Preload("Authors").Preload("Categories")
	if categoryID != "" {
		query = query.Joins("JOIN blog_categories ON blog_categories.blog_id = blogs.id").
			Where("blog_categories.category_id = ?", categoryID)
	}

	query.Order("pinned DESC, created_at DESC").Find(&blogs)
	c.JSON(http.StatusOK, blogs)
}

func GetBlog(c *gin.Context) {
	var blog models.Blog
	if err := database.DB.Preload("Authors").Preload("Categories").First(&blog, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}
	c.JSON(http.StatusOK, blog)
}

func GetBlogBySlug(c *gin.Context) {
	var blog models.Blog
	if err := database.DB.Preload("Authors").Preload("Categories").Where("slug = ?", c.Param("slug")).First(&blog).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}
	c.JSON(http.StatusOK, blog)
}

func CreateBlog(c *gin.Context) {
	title := c.PostForm("title")
	slug := c.PostForm("slug")
	excerpt := c.PostForm("excerpt")
	content := c.PostForm("content")
	imageURL := c.PostForm("image")
	pinnedStr := c.PostForm("pinned")
	authorIDsStr := c.PostForm("author_ids")
	categoryIDsStr := c.PostForm("category_ids")

	if title == "" || slug == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title and slug are required"})
		return
	}
	if authorIDsStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Author IDs are required"})
		return
	}

	authorIDs := strings.Split(authorIDsStr, ",")
	var authors []models.User
	if err := database.DB.Where("id IN ?", authorIDs).Find(&authors).Error; err != nil || len(authors) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Authors not found"})
		return
	}

	blog := models.Blog{
		Title:   title,
		Slug:    slug,
		Excerpt: excerpt,
		Content: content,
		Image:   imageURL,
		Pinned:  pinnedStr == "true" || pinnedStr == "1",
		Authors: authors,
	}

	database.DB.Create(&blog)

	// Categories hinzufügen
	if categoryIDsStr != "" {
		categoryIDs := strings.Split(categoryIDsStr, ",")
		var categories []models.Category
		if err := database.DB.Where("id IN ?", categoryIDs).Find(&categories).Error; err == nil {
			database.DB.Model(&blog).Association("Categories").Replace(categories)
		}
	}

	// Bild hochgeladen?
	file, err := c.FormFile("image_file")
	if err == nil {
		blogDir := filepath.Join("public", "blogs", strconv.Itoa(int(blog.ID)))
		if err := os.MkdirAll(blogDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create blog directory"})
			return
		}

		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("image%s", ext)
		filePath := filepath.Join(blogDir, filename)

		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}

		blog.Image = fmt.Sprintf("%s/blogs/%d/%s", getCDNURL(), blog.ID, filename)
		database.DB.Save(&blog)
	}

	database.DB.Preload("Authors").Preload("Categories").First(&blog, blog.ID)
	c.JSON(http.StatusCreated, blog)
}

func UpdateBlog(c *gin.Context) {
	var blog models.Blog
	if err := database.DB.First(&blog, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}

	// Form Data auslesen
	title := c.PostForm("title")
	slug := c.PostForm("slug")
	excerpt := c.PostForm("excerpt")
	content := c.PostForm("content")
	imageURL := c.PostForm("image")
	pinnedStr := c.PostForm("pinned")
	authorIDsStr := c.PostForm("author_ids")
	categoryIDsStr := c.PostForm("category_ids")

	if title != "" {
		blog.Title = title
	}
	if slug != "" {
		blog.Slug = slug
	}
	if excerpt != "" {
		blog.Excerpt = excerpt
	}
	if content != "" {
		blog.Content = content
	}
	if imageURL != "" {
		blog.Image = imageURL
	}
	if pinnedStr != "" {
		blog.Pinned = pinnedStr == "true" || pinnedStr == "1"
	}

	// Bild hochgeladen?
	file, err := c.FormFile("image_file")
	if err == nil {
		blogDir := filepath.Join("public", "blogs", strconv.Itoa(int(blog.ID)))
		if err := os.MkdirAll(blogDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create blog directory"})
			return
		}

		// Alte Bilder löschen
		matches, _ := filepath.Glob(filepath.Join(blogDir, "image.*"))
		for _, match := range matches {
			os.Remove(match)
		}

		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("image%s", ext)
		filePath := filepath.Join(blogDir, filename)

		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}

		blog.Image = fmt.Sprintf("%s/blogs/%d/%s", getCDNURL(), blog.ID, filename)
	}

	// Author IDs verarbeiten
	if authorIDsStr != "" {
		authorIDs := strings.Split(authorIDsStr, ",")
		var authors []models.User
		database.DB.Where("id IN ?", authorIDs).Find(&authors)
		database.DB.Model(&blog).Association("Authors").Replace(authors)
	}

	// Category IDs verarbeiten
	if categoryIDsStr != "" {
		categoryIDs := strings.Split(categoryIDsStr, ",")
		var categories []models.Category
		database.DB.Where("id IN ?", categoryIDs).Find(&categories)
		database.DB.Model(&blog).Association("Categories").Replace(categories)
	}

	database.DB.Save(&blog)
	database.DB.Preload("Authors").Preload("Categories").First(&blog, blog.ID)
	c.JSON(http.StatusOK, blog)
}

func DeleteBlog(c *gin.Context) {
	var blog models.Blog
	if err := database.DB.First(&blog, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}

	blogID := blog.ID

	// Transaktion: Erst Verknüpfungen, dann Blog löschen
	tx := database.DB.Begin()

	if err := tx.Exec("DELETE FROM blog_authors WHERE blog_id = ?", blogID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete blog authors"})
		return
	}

	if err := tx.Exec("DELETE FROM blog_categories WHERE blog_id = ?", blogID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete blog categories"})
		return
	}

	if err := tx.Delete(&blog).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete blog"})
		return
	}

	tx.Commit()

	// Blog-Bilder Ordner löschen
	os.RemoveAll(filepath.Join("public", "blogs", strconv.Itoa(int(blogID))))

	c.JSON(http.StatusOK, gin.H{"message": "Blog deleted"})
}
