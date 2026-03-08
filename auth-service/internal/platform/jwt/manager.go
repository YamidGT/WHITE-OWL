package jwt

import (
	"crypto/rsa"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Claims representa el payload del JWT.
// Solo incluye lo necesario: los otros microservicios solo necesitan
// user_id y email para operar sin consultar al auth service.
type Claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

// Manager firma y verifica JWTs con RS256.
type Manager struct {
	privateKey *rsa.PrivateKey
	publicKey  *rsa.PublicKey
	ttl        time.Duration
}

// NewManager carga las claves RSA desde disco y retorna un Manager listo.
func NewManager(privateKeyPath, publicKeyPath string, ttlSeconds int) (*Manager, error) {
	privateKey, err := loadPrivateKey(privateKeyPath)
	if err != nil {
		return nil, fmt.Errorf("cargar clave privada: %w", err)
	}

	publicKey, err := loadPublicKey(publicKeyPath)
	if err != nil {
		return nil, fmt.Errorf("cargar clave pública: %w", err)
	}

	return &Manager{
		privateKey: privateKey,
		publicKey:  publicKey,
		ttl:        time.Duration(ttlSeconds) * time.Second,
	}, nil
}

// Generate crea y firma un access token para el usuario dado.
func (m *Manager) Generate(userID uuid.UUID, email string) (string, error) {
	now := time.Now()

	claims := Claims{
		Email: email,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(m.ttl)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)

	signed, err := token.SignedString(m.privateKey)
	if err != nil {
		return "", fmt.Errorf("firmar token: %w", err)
	}

	return signed, nil
}

// Verify parsea y valida un access token. Retorna los claims si es válido.
func (m *Manager) Verify(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&Claims{},
		func(t *jwt.Token) (any, error) {
			// Verificar explícitamente que el algoritmo sea RS256.
			// Sin esto, un atacante podría enviar un token firmado con "none".
			if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("algoritmo inesperado: %v", t.Header["alg"])
			}
			return m.publicKey, nil
		},
	)
	if err != nil {
		return nil, fmt.Errorf("token inválido: %w", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("claims inválidos")
	}

	return claims, nil
}

// PublicKey expone la clave pública para el endpoint /.well-known/jwks.json.
func (m *Manager) PublicKey() *rsa.PublicKey {
	return m.publicKey
}

// --- helpers de carga de claves ---

func loadPrivateKey(path string) (*rsa.PrivateKey, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return jwt.ParseRSAPrivateKeyFromPEM(data)
}

func loadPublicKey(path string) (*rsa.PublicKey, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return jwt.ParseRSAPublicKeyFromPEM(data)
}
