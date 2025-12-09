package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Language struct {
	ID        string    `json:"id" gorm:"type:char(36);primaryKey"`
	Icon      string    `json:"icon" gorm:"type:varchar(500)"`
	Name      string    `json:"name" gorm:"type:varchar(100);not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (l *Language) BeforeCreate(tx *gorm.DB) error {
	if l.ID == "" {
		l.ID = uuid.New().String()
	}
	return nil
}
