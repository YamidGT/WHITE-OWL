package domain

import (
	"time"

	"github.com/google/uuid"
)

// RefreshToken representa una sesión activa de un usuario.
// Se guarda el hash del token, nunca el valor raw.
type RefreshToken struct {
	ID        uuid.UUID `db:"id"`
	UserID    uuid.UUID `db:"user_id"`
	TokenHash string    `db:"token_hash"`
	UserAgent string    `db:"user_agent"` // dispositivo o navegador
	IPAddress string    `db:"ip_address"` // IP de origen
	ExpiresAt time.Time `db:"expires_at"`
	CreatedAt time.Time `db:"created_at"`
	Revoked   bool      `db:"revoked"`
}

// IsExpired indica si el token ya venció.
func (rt *RefreshToken) IsExpired() bool {
	return time.Now().After(rt.ExpiresAt)
}

// IsValid indica si el token puede usarse para renovar el access token.
func (rt *RefreshToken) IsValid() bool {
	return !rt.Revoked && !rt.IsExpired()
}
