package domain

import (
	"context"

	"github.com/google/uuid"
)

// UserRepository define las operaciones de persistencia para usuarios.
type UserRepository interface {
	// FindByGoogleID busca un usuario por su ID de Google.
	// Retorna ErrUserNotFound si no existe.
	FindByGoogleID(ctx context.Context, googleID string) (*User, error)

	// FindByID busca un usuario por su UUID interno.
	// Retorna ErrUserNotFound si no existe.
	FindByID(ctx context.Context, id uuid.UUID) (*User, error)

	// Upsert crea el usuario si no existe, o actualiza name/picture/last_login si ya existe.
	// Retorna el usuario resultante.
	Upsert(ctx context.Context, user *User) (*User, error)
}

// TokenRepository define las operaciones de persistencia para refresh tokens.
type TokenRepository interface {
	// Save persiste un nuevo refresh token.
	Save(ctx context.Context, token *RefreshToken) error

	// FindByHash busca un token por su hash SHA-256.
	// Retorna ErrInvalidRefreshToken si no existe.
	FindByHash(ctx context.Context, hash string) (*RefreshToken, error)

	// Revoke marca un token como revocado por su hash.
	Revoke(ctx context.Context, hash string) error

	// RevokeAllForUser revoca todas las sesiones activas de un usuario.
	// Útil para "cerrar todas las sesiones" o ante sospecha de compromiso (de seguridad).
	RevokeAllForUser(ctx context.Context, userID uuid.UUID) error

	// DeleteExpired elimina tokens expirados de la BD.
	// Se llama periódicamente para mantener la tabla limpia.
	DeleteExpired(ctx context.Context) error
}
