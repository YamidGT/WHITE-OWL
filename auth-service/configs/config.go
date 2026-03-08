package configs

import (
	"os"
	"strconv"
)

// Config agrupa toda la configuración del servicio.
// Se carga desde variables de entorno (o .env en desarrollo).
type Config struct {
	// Servidor
	Port string

	// Base de datos
	DatabaseURL string

	// Google OAuth
	GoogleClientID string

	// JWT
	JWTPrivateKeyPath string // path a private.pem
	JWTPublicKeyPath  string // path a public.pem

	// Dominio permitido
	AllowedDomain string

	// Duración de tokens (en segundos)
	AccessTokenTTL  int // default: 900 (15 min)
	RefreshTokenTTL int // default: 604800 (7 días)
}

// Load lee las variables de entorno y retorna la configuración.
// Falla rápido si faltan variables críticas.
func Load() *Config {
	return &Config{
		Port:              getEnv("PORT", "3000"),
		DatabaseURL:       mustGetEnv("DATABASE_URL"),
		GoogleClientID:    mustGetEnv("GOOGLE_CLIENT_ID"),
		JWTPrivateKeyPath: getEnv("JWT_PRIVATE_KEY_PATH", "./keys/private.pem"),
		JWTPublicKeyPath:  getEnv("JWT_PUBLIC_KEY_PATH", "./keys/public.pem"),
		AllowedDomain:     getEnv("ALLOWED_DOMAIN", "@unal.edu.co"),
		AccessTokenTTL:    getEnvInt("ACCESS_TOKEN_TTL", 900),
		RefreshTokenTTL:   getEnvInt("REFRESH_TOKEN_TTL", 604800),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mustGetEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		panic("variable de entorno requerida no definida: " + key)
	}
	return v
}

func getEnvInt(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return n
}
