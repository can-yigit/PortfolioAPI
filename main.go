package main

import (
	"os"

	"PortfolioAPI/database"
	"PortfolioAPI/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.Connect()

	// Public Ordner erstellen falls nicht vorhanden
	os.MkdirAll("public/users", 0755)
	os.MkdirAll("public/blogs", 0755)

	r := gin.Default()

	// CDN Route für statische Dateien
	r.Static("/cdn", "./public")

	// CORS Middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.GET("/users", handlers.GetUsers)
	r.GET("/users/:id", handlers.GetUser)
	r.POST("/users", handlers.CreateUser)
	r.PUT("/users/:id", handlers.UpdateUser)

	r.GET("/blogs", handlers.GetBlogs)
	r.GET("/blogs/:id", handlers.GetBlog)
	r.GET("/blogs/slug/:slug", handlers.GetBlogBySlug)
	r.POST("/blogs", handlers.CreateBlog)
	r.PUT("/blogs/:id", handlers.UpdateBlog)
	r.DELETE("/blogs/:id", handlers.DeleteBlog)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
