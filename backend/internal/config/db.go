package config

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database
// IsDBConnected is defined in cache.go

func ConnectMongo() {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		// Fallback to local default if not set, similar to legacy code
		uri = "mongodb://127.0.0.1:27017/O2O"
		log.Println("MONGO_URI not defined, using fallback:", uri)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Println("⚠️  Error connecting to MongoDB: ", err)
		return
	}

	log.Println("☑️  Connected to MongoDB")
	DB = client.Database("O2O")
	IsDBConnected = true
}
