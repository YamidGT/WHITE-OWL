package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/google/uuid"

	"auth-service/configs"
	"auth-service/internal/domain"
	"auth-service/internal/platform/google"
	jwtmanager "auth-service/internal/platform/jwt"
)

// AuthService contiene toda la lógica de negocio de autenticación.
type AuthService struct {
	config      *configs.Config
	users       domain.UserRepository
	tokens      domain.TokenRepository
	jwtManager  *jwtmanager.Manager
	googleVerif *google.Verifier
}

// NewAuthService construye el service con todas sus dependencias.
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

// DTOs de entrada y salida

// LoginInput contiene los datos que llegan del handler al iniciar sesión.
type LoginInput struct {
	IDToken   string
	UserAgent string
	IPAddress string
}

// AuthResult es la respuesta exitosa de login o refresh.
type AuthResult struct {
	AccessToken  string
	RefreshToken string
	ExpiresIn    int // segundos hasta que vence el access token
}

// UserInfo es la respuesta del endpoint /me.
type UserInfo struct {
	ID      uuid.UUID
	Email   string
	Name    string
	Picture string
}

// Métodos del service

// LoginWithGoogle valida el ID Token de Google, verifica el dominio,
// persiste el usuario y genera los tokens de sesión.
func (s *AuthService) LoginWithGoogle(ctx context.Context, input LoginInput) (*AuthResult, error) {
	// 1. Verificar el ID Token con Google.
	googleUser, err := s.googleVerif.Verify(ctx, input.IDToken)
	if err != nil {
		return nil, domain.ErrInvalidGoogleToken
	}

	// 2. Verificar dominio institucional.
	candidate := &domain.User{Email: googleUser.Email}
	if !candidate.HasDomain(s.config.AllowedDomain) {
		return nil, domain.ErrDomainNotAllowed
	}

	// 3. Crear o actualizar el usuario en BD.
	user, err := s.users.Upsert(ctx, &domain.User{
		Email:    googleUser.Email,
		Name:     googleUser.Name,
		GoogleID: googleUser.GoogleID,
		Picture:  googleUser.Picture,
	})
	if err != nil {
		return nil, fmt.Errorf("persistir usuario: %w", err)
	}

	// 4. Generar tokens de sesión.
	return s.generateSession(ctx, user, input.UserAgent, input.IPAddress)
}

// RefreshSession rota el refresh token y emite un nuevo access token.
// El token usado queda revocado, cada refresh token es de un solo uso.
func (s *AuthService) RefreshSession(ctx context.Context, rawRefreshToken string) (*AuthResult, error) {
	// 1. Calcular hash del token recibido para buscarlo en BD.
	hash := hashToken(rawRefreshToken)

	// 2. Buscar el token en BD.
	stored, err := s.tokens.FindByHash(ctx, hash)
	if err != nil {
		return nil, domain.ErrInvalidRefreshToken
	}

	// 3. Validar que no esté revocado ni expirado.
	if !stored.IsValid() {
		return nil, domain.ErrInvalidRefreshToken
	}

	// 4. Revocar el token usado: cada refresh genera uno nuevo.
	if err := s.tokens.Revoke(ctx, hash); err != nil {
		return nil, fmt.Errorf("revocar token anterior: %w", err)
	}

	// 5. Obtener el usuario.
	user, err := s.users.FindByID(ctx, stored.UserID)
	if err != nil {
		return nil, domain.ErrUserNotFound
	}

	// 6. Generar nueva sesión, manteniendo user_agent e ip del token original.
	return s.generateSession(ctx, user, stored.UserAgent, stored.IPAddress)
}

// Logout revoca el refresh token, invalidando la sesión.
func (s *AuthService) Logout(ctx context.Context, rawRefreshToken string) error {
	hash := hashToken(rawRefreshToken)
	// Revoke es idempotente — no falla si el token ya estaba revocado.
	return s.tokens.Revoke(ctx, hash)
}

// GetCurrentUser retorna los datos del usuario a partir del access token.
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

// generateSession emite un access token JWT y un refresh token,
// persiste el refresh token en BD y retorna el AuthResult.
func (s *AuthService) generateSession(
	ctx context.Context,
	user *domain.User,
	userAgent, ipAddress string,
) (*AuthResult, error) {
	// Access token JWT firmado con RS256.
	accessToken, err := s.jwtManager.Generate(user.ID, user.Email)
	if err != nil {
		return nil, fmt.Errorf("generar access token: %w", err)
	}

	// Refresh token: valor aleatorio opaco de 32 bytes.
	rawRefreshToken, err := generateSecureToken()
	if err != nil {
		return nil, fmt.Errorf("generar refresh token: %w", err)
	}

	// Persistir el hash del refresh token, nunca el valor raw.
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
		RefreshToken: rawRefreshToken, // se envía al cliente solo aquí, nunca más
		ExpiresIn:    s.config.AccessTokenTTL,
	}, nil
}

// generateSecureToken genera un token opaco aleatorio de 32 bytes (64 chars hex).
func generateSecureToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// hashToken calcula el SHA-256 hex de un token raw.
// Es lo que se guarda en BD y lo que se usa para buscar.
func hashToken(raw string) string {
	h := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(h[:])
}
