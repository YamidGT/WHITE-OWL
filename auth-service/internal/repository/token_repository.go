package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"auth-service/internal/domain"
)

type tokenRepository struct {
	db *pgxpool.Pool
}

// NewTokenRepository crea una implementación PostgreSQL de domain.TokenRepository.
func NewTokenRepository(db *pgxpool.Pool) domain.TokenRepository {
	return &tokenRepository{db: db}
}

func (r *tokenRepository) Save(ctx context.Context, token *domain.RefreshToken) error {
	query := `
		INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.Exec(ctx, query,
		token.UserID, token.TokenHash, token.UserAgent, token.IPAddress, token.ExpiresAt,
	)
	if err != nil {
		return fmt.Errorf("Save token: %w", err)
	}
	return nil
}

func (r *tokenRepository) FindByHash(ctx context.Context, hash string) (*domain.RefreshToken, error) {
	query := `
		SELECT id, user_id, token_hash, user_agent, ip_address, expires_at, created_at, revoked
		FROM refresh_tokens
		WHERE token_hash = $1
	`
	var t domain.RefreshToken
	err := r.db.QueryRow(ctx, query, hash).Scan(
		&t.ID, &t.UserID, &t.TokenHash, &t.UserAgent, &t.IPAddress,
		&t.ExpiresAt, &t.CreatedAt, &t.Revoked,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrInvalidRefreshToken
		}
		return nil, fmt.Errorf("FindByHash: %w", err)
	}
	return &t, nil
}

func (r *tokenRepository) Revoke(ctx context.Context, hash string) error {
	query := `UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1`
	_, err := r.db.Exec(ctx, query, hash)
	if err != nil {
		return fmt.Errorf("Revoke token: %w", err)
	}
	return nil
}

func (r *tokenRepository) RevokeAllForUser(ctx context.Context, userID uuid.UUID) error {
	query := `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1 AND revoked = FALSE`
	_, err := r.db.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("RevokeAllForUser: %w", err)
	}
	return nil
}

func (r *tokenRepository) DeleteExpired(ctx context.Context) error {
	query := `DELETE FROM refresh_tokens WHERE expires_at < NOW()`
	_, err := r.db.Exec(ctx, query)
	if err != nil {
		return fmt.Errorf("DeleteExpired: %w", err)
	}
	return nil
}
