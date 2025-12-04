package database

import (
	"database/sql"
	"os"

	"PortfolioAPI/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	godotenv.Load(".env.local")

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "root"
	}
	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "noaccess"
	}
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "3306"
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "portfolio"
	}

	createDsn := user + ":" + password + "@tcp(" + host + ":" + port + ")/?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := sql.Open("mysql", createDsn)
	if err != nil {
		panic("Failed to connect to MySQL: " + err.Error())
	}
	db.Exec("CREATE DATABASE IF NOT EXISTS " + dbName)
	db.Close()

	dsn := user + ":" + password + "@tcp(" + host + ":" + port + ")/" + dbName + "?charset=utf8mb4&parseTime=True&loc=Local"
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database: " + err.Error())
	}

	database.AutoMigrate(&models.User{}, &models.Blog{})

	DB = database
}

