package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        string    `json:"id" gorm:"type:char(36);primaryKey"`
	Name      string    `json:"name" gorm:"type:varchar(255);not null"`
	Email     *string   `json:"email" gorm:"type:varchar(255);uniqueIndex"`
	Avatar    string    `json:"avatar" gorm:"type:varchar(500)"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Blogs     []Blog    `json:"blogs,omitempty" gorm:"many2many:blog_authors;"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}
