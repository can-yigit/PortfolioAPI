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
	os.MkdirAll("public/languages", 0755)
	os.MkdirAll("public/projects", 0755)

	r := gin.Default()

	// CORS Middleware (muss vor den Routes kommen)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "https://admin.canyigit.com", "https://www.canyigit.com", "https://canyigit.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "Expires", "Cache-Control", "Pragma"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// CDN Route für statische Dateien
	r.Static("/cdn", "./public")

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

	r.GET("/languages", handlers.GetLanguages)
	r.GET("/languages/:id", handlers.GetLanguage)
	r.POST("/languages", handlers.CreateLanguage)
	r.PUT("/languages/:id", handlers.UpdateLanguage)
	r.DELETE("/languages/:id", handlers.DeleteLanguage)

	r.GET("/projects", handlers.GetProjects)
	r.GET("/projects/:id", handlers.GetProject)
	r.POST("/projects", handlers.CreateProject)
	r.PUT("/projects/:id", handlers.UpdateProject)
	r.DELETE("/projects/:id", handlers.DeleteProject)

	r.GET("/categories", handlers.GetCategories)
	r.GET("/categories/:id", handlers.GetCategory)
	r.POST("/categories", handlers.CreateCategory)
	r.PUT("/categories/:id", handlers.UpdateCategory)
	r.DELETE("/categories/:id", handlers.DeleteCategory)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
