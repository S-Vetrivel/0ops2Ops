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

func ConnectMongo() {
	uri := os.Getenv("MONGO_DB")
	if uri == "" {
		// Fallback to local default if not set, similar to legacy code
		uri = "mongodb://127.0.0.1:27017/sass"
		log.Println("MONGO_DB not defined, using fallback:", uri)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal("Error connecting to MongoDB: ", err)
	}

	// Verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Could not ping MongoDB: ", err)
	}

	log.Println("☑️  Connected to MongoDB")
	DB = client.Database("test") // Defaulting to "test" as per Mongoose default, or check if URI has db name
}
