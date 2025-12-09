package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Project struct {
	ID          string     `json:"id" gorm:"type:char(36);primaryKey"`
	Title       string     `json:"title" gorm:"type:varchar(255);not null"`
	Description string     `json:"description" gorm:"type:text;not null"`
	Image       string     `json:"image" gorm:"type:varchar(500)"`
	Link        string     `json:"link" gorm:"type:varchar(500)"`
	Languages   []Language `json:"languages" gorm:"many2many:project_languages;"`
	Authors     []User     `json:"authors" gorm:"many2many:project_authors;"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (p *Project) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}
