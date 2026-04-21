package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type LogEntry struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Type      string             `bson:"type" json:"type"` // "traffic", "attack", "user"
	IP        string             `bson:"ip" json:"ip"`
	Method    string             `bson:"method" json:"method"`
	Path      string             `bson:"path" json:"path"`
	Status    int                `bson:"status" json:"status"`
	Message   string             `bson:"message" json:"message"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}
