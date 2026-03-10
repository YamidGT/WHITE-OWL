package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"

	"auth-service/configs"
	"auth-service/internal/domain"
	"auth-service/internal/platform/google"
	jwtmanager "auth-service/internal/platform/jwt"
)

const cleanupInterval = 24 * time.Hour

// AuthService contiene toda la lógica de negocio de autenticación.
type AuthService struct {
	config      *configs.Config
	users       domain.UserRepository
	tokens      domain.TokenRepository
	jwtManager  *jwtmanager.Manager
	googleVerif *google.Verifier
}

func NewAuthService(
	cfg *configs.Config,
	users domain.UserRepository,
	tokens domain.TokenRepository,
	jwtManager *jwtmanager.Manager,
	googleVerif *google.Verifier,
) *AuthService {
	return &AuthService{
		config:      cfg,
		users:       users,
		tokens:      tokens,
		jwtManager:  jwtManager,
		googleVerif: googleVerif,
	}
}

// StartCleanupWorker lanza una goroutine que elimina tokens expirados
// cada 24h. Se detiene cuando el contexto se cancela (graceful shutdown).
func (s *AuthService) StartCleanupWorker(ctx context.Context) {
	go func() {
		ticker := time.NewTicker(cleanupInterval)
		defer ticker.Stop()

		log.Println("Cleanup worker de tokens iniciado")

		for {
			select {
			case <-ticker.C:
				if err := s.tokens.DeleteExpired(ctx); err != nil {
					log.Printf("cleanup tokens expirados: %v", err)
				} else {
					log.Println("cleanup: tokens expirados eliminados")
				}
			case <-ctx.Done():
				log.Println("cleanup worker detenido")
				return
			}
		}
	}()
}

// DTOs

type LoginInput struct {
	IDToken   string
	UserAgent string
	IPAddress string
}

type AuthResult struct {
	AccessToken  string
	RefreshToken string
	ExpiresIn    int
}

type UserInfo struct {
	ID      uuid.UUID
	Email   string
	Name    string
	Picture string
}

// Métodos de negocio

func (s *AuthService) LoginWithGoogle(ctx context.Context, input LoginInput) (*AuthResult, error) {
	// 1. Verificar ID Token con Google.
	googleUser, err := s.googleVerif.Verify(ctx, input.IDToken)
	if err != nil {
		return nil, domain.ErrInvalidGoogleToken
	}

	// 2. Verificar dominio institucional.
	candidate := &domain.User{Email: googleUser.Email}
	if !candidate.HasDomain(s.config.AllowedDomain) {
		return nil, domain.ErrDomainNotAllowed
	}

	// 3. Crear o actualizar usuario en BD.
	user, err := s.users.Upsert(ctx, &domain.User{
		Email:    googleUser.Email,
		Name:     googleUser.Name,
		GoogleID: googleUser.GoogleID,
		Picture:  googleUser.Picture,
	})
	if err != nil {
		return nil, fmt.Errorf("persistir usuario: %w", err)
	}

	return s.generateSession(ctx, user, input.UserAgent, input.IPAddress)
}

// RefreshSession rota el refresh token y emite una nueva sesión.
// Si el token recibido ya estaba revocado, asume un posible replay attack
// y revoca todas las sesiones activas del usuario como medida de seguridad.
func (s *AuthService) RefreshSession(ctx context.Context, rawRefreshToken string) (*AuthResult, error) {
	hash := hashToken(rawRefreshToken)

	stored, err := s.tokens.FindByHash(ctx, hash)
	if err != nil {
		return nil, domain.ErrInvalidRefreshToken
	}

	// Token revocado usado de nuevo — posible replay attack.
	// Revocar todas las sesiones del usuario por precaución.
	if stored.Revoked {
		log.Printf("refresh token revocado reutilizado — revocando todas las sesiones del usuario %s", stored.UserID)
		_ = s.tokens.RevokeAllForUser(ctx, stored.UserID)
		return nil, domain.ErrInvalidRefreshToken
	}

	if stored.IsExpired() {
		return nil, domain.ErrInvalidRefreshToken
	}

	// Token válido — revocar y emitir nueva sesión.
	if err := s.tokens.Revoke(ctx, hash); err != nil {
		return nil, fmt.Errorf("revocar token: %w", err)
	}

	user, err := s.users.FindByID(ctx, stored.UserID)
	if err != nil {
		return nil, domain.ErrUserNotFound
	}

	return s.generateSession(ctx, user, stored.UserAgent, stored.IPAddress)
}

func (s *AuthService) Logout(ctx context.Context, rawRefreshToken string) error {
	return s.tokens.Revoke(ctx, hashToken(rawRefreshToken))
}

func (s *AuthService) GetCurrentUser(ctx context.Context, accessToken string) (*UserInfo, error) {
	claims, err := s.jwtManager.Verify(accessToken)
	if err != nil {
		return nil, domain.ErrInvalidAccessToken
	}

	userID, err := uuid.Parse(claims.Subject)
	if err != nil {
		return nil, domain.ErrInvalidAccessToken
	}

	user, err := s.users.FindByID(ctx, userID)
	if err != nil {
		return nil, domain.ErrUserNotFound
	}

	return &UserInfo{
		ID:      user.ID,
		Email:   user.Email,
		Name:    user.Name,
		Picture: user.Picture,
	}, nil
}

// Helpers privados

func (s *AuthService) generateSession(
	ctx context.Context,
	user *domain.User,
	userAgent, ipAddress string,
) (*AuthResult, error) {
	accessToken, err := s.jwtManager.Generate(user.ID, user.Email)
	if err != nil {
		return nil, fmt.Errorf("generar access token: %w", err)
	}

	rawRefreshToken, err := generateSecureToken()
	if err != nil {
		return nil, fmt.Errorf("generar refresh token: %w", err)
	}

	refreshTTL := time.Duration(s.config.RefreshTokenTTL) * time.Second
	err = s.tokens.Save(ctx, &domain.RefreshToken{
		UserID:    user.ID,
		TokenHash: hashToken(rawRefreshToken),
		UserAgent: userAgent,
		IPAddress: ipAddress,
		ExpiresAt: time.Now().Add(refreshTTL),
	})
	if err != nil {
		return nil, fmt.Errorf("persistir refresh token: %w", err)
	}

	return &AuthResult{
		AccessToken:  accessToken,
		RefreshToken: rawRefreshToken,
		ExpiresIn:    s.config.AccessTokenTTL,
	}, nil
}

func generateSecureToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func hashToken(raw string) string {
	h := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(h[:])
}
