package utils

import (
	"regexp"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func IsPasswordStrong(password string) bool {
    // Regex: At least 8 chars, 1 upper, 1 lower, 1 number, 1 special char
    // Note: Go regex syntax is slightly different but standard PCRE usually works
    // Go "regexp" doesn't support lookaheads directly (?=), so we must check conditions separately
    
    if len(password) < 8 {
        return false
    }
    
    hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
    hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
    hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
    hasSpecial := regexp.MustCompile(`[@$!%*?&]`).MatchString(password)
    
    return hasUpper && hasLower && hasNumber && hasSpecial
}
