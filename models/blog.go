package models

import "time"

type Blog struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Title     string    `json:"title" gorm:"not null"`
	Slug      string    `json:"slug" gorm:"uniqueIndex;not null"`
	Excerpt   string    `json:"excerpt"`
	Content   string    `json:"content" gorm:"type:text"`
	Image     string    `json:"image"`
	Category  string    `json:"category"`
	Pinned    bool      `json:"pinned" gorm:"default:false"`
	Authors   []User    `json:"authors" gorm:"many2many:blog_authors;"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateBlogInput struct {
	Title     string   `json:"title" binding:"required"`
	Slug      string   `json:"slug" binding:"required"`
	Excerpt   string   `json:"excerpt"`
	Content   string   `json:"content"`
	Image     string   `json:"image"`
	Category  string   `json:"category"`
	Pinned    bool     `json:"pinned"`
	AuthorIDs []string `json:"author_ids" binding:"required"`
}

type UpdateBlogInput struct {
	Title     string   `json:"title"`
	Slug      string   `json:"slug"`
	Excerpt   string   `json:"excerpt"`
	Content   string   `json:"content"`
	Image     string   `json:"image"`
	Category  string   `json:"category"`
	Pinned    bool     `json:"pinned"`
	AuthorIDs []string `json:"author_ids"`
}
