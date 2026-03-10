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

type userRepository struct {
	db *pgxpool.Pool
}

// NewUserRepository crea una implementación PostgreSQL de domain.UserRepository.
func NewUserRepository(db *pgxpool.Pool) domain.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindByGoogleID(ctx context.Context, googleID string) (*domain.User, error) {
	query := `
		SELECT id, email, name, google_id, picture, last_login, created_at
		FROM users
		WHERE google_id = $1
	`
	user, err := scanUser(r.db.QueryRow(ctx, query, googleID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrUserNotFound
		}
		return nil, fmt.Errorf("FindByGoogleID: %w", err)
	}
	return user, nil
}

func (r *userRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	query := `
		SELECT id, email, name, google_id, picture, last_login, created_at
		FROM users
		WHERE id = $1
	`
	user, err := scanUser(r.db.QueryRow(ctx, query, id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrUserNotFound
		}
		return nil, fmt.Errorf("FindByID: %w", err)
	}
	return user, nil
}

func (r *userRepository) Upsert(ctx context.Context, u *domain.User) (*domain.User, error) {
	// Si el usuario ya existe (mismo google_id), actualizamos datos que pueden cambiar
	// en Google: nombre, foto y última vez que inició sesión.
	// El email no se actualiza, es el identificador institucional.
	query := `
		INSERT INTO users (email, name, google_id, picture, last_login)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (google_id) DO UPDATE SET
			name       = EXCLUDED.name,
			picture    = EXCLUDED.picture,
			last_login = NOW()
		RETURNING id, email, name, google_id, picture, last_login, created_at
	`
	user, err := scanUser(r.db.QueryRow(ctx, query, u.Email, u.Name, u.GoogleID, u.Picture))
	if err != nil {
		return nil, fmt.Errorf("Upsert user: %w", err)
	}
	return user, nil
}

// scanUser escanea una fila de PostgreSQL en un domain.User.
func scanUser(row pgx.Row) (*domain.User, error) {
	var u domain.User
	err := row.Scan(
		&u.ID,
		&u.Email,
		&u.Name,
		&u.GoogleID,
		&u.Picture,
		&u.LastLogin,
		&u.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}
