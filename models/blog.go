package models

import "time"

type Blog struct {
	ID         uint       `json:"id" gorm:"primaryKey"`
	Title      string     `json:"title" gorm:"type:varchar(255);not null"`
	Slug       string     `json:"slug" gorm:"type:varchar(255);uniqueIndex;not null"`
	Excerpt    string     `json:"excerpt" gorm:"type:varchar(500)"`
	Content    string     `json:"content" gorm:"type:text"`
	Image      string     `json:"image" gorm:"type:varchar(500)"`
	Pinned     bool       `json:"pinned" gorm:"default:false"`
	Authors    []User     `json:"authors" gorm:"many2many:blog_authors;"`
	Categories []Category `json:"categories" gorm:"many2many:blog_categories;"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

type CreateBlogInput struct {
	Title       string   `json:"title" binding:"required"`
	Slug        string   `json:"slug" binding:"required"`
	Excerpt     string   `json:"excerpt"`
	Content     string   `json:"content"`
	Image       string   `json:"image"`
	Pinned      bool     `json:"pinned"`
	AuthorIDs   []string `json:"author_ids" binding:"required"`
	CategoryIDs []string `json:"category_ids"`
}

type UpdateBlogInput struct {
	Title       string   `json:"title"`
	Slug        string   `json:"slug"`
	Excerpt     string   `json:"excerpt"`
	Content     string   `json:"content"`
	Image       string   `json:"image"`
	Pinned      bool     `json:"pinned"`
	AuthorIDs   []string `json:"author_ids"`
	CategoryIDs []string `json:"category_ids"`
}
