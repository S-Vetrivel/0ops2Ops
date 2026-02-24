package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	GoogleId          string             `bson:"googleId,omitempty" json:"googleId,omitempty"`
	GitHubAccessToken string             `bson:"githubAccessToken,omitempty" json:"-"` // Store token, don't return so easily
	Username          string             `bson:"username" json:"username"`
	Fullname       string             `bson:"fullname" json:"fullname"`
	Age            int                `bson:"age,omitempty" json:"age,omitempty"`
	Gender         string             `bson:"gender,omitempty" json:"gender,omitempty"`
	Email          string             `bson:"email" json:"email"`
	Password       string             `bson:"password,omitempty" json:"-"` // Don't return password in JSON
	Phone          string             `bson:"phone,omitempty" json:"phone,omitempty"`
	CreatedAt      time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time          `bson:"updatedAt" json:"updatedAt"`
	ProfilePicture string             `bson:"profilePicture,omitempty" json:"profilePicture,omitempty"`
	Role           string             `bson:"role" json:"role"`
}
