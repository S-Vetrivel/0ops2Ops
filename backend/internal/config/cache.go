package config

import (
	"backend/internal/models"
	"sync"
)

var (
	// In-memory collections for Demo Mode
	UserCache = make(map[string]models.User)
	UserMutex sync.RWMutex

	// Simple check for DB connectivity
	IsDBConnected bool
)

func RegisterUserInCache(id string, user models.User) {
	UserMutex.Lock()
	defer UserMutex.Unlock()
	UserCache[id] = user
}

func GetUserFromCache(id string) (models.User, bool) {
	UserMutex.RLock()
	defer UserMutex.RUnlock()
	user, exists := UserCache[id]
	return user, exists
}

// Helper for demo login by email
func GetUserByEmailFromCache(email string) (models.User, bool) {
	UserMutex.RLock()
	defer UserMutex.RUnlock()
	for _, user := range UserCache {
		if user.Email == email {
			return user, true
		}
	}
	return models.User{}, false
}
