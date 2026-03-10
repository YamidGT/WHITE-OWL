package google

import (
	"context"
	"fmt"

	"google.golang.org/api/idtoken"
)

// UserInfo contiene los datos extraídos del Google ID Token.
// Solo los campos que realmente se necesitan del payload de Google.
type UserInfo struct {
	GoogleID string
	Email    string
	Name     string
	Picture  string
}

// Verifier valida Google ID Tokens usando las claves públicas de Google.
type Verifier struct {
	clientID string
}

// NewVerifier crea un Verifier con el Client ID de la aplicación.
func NewVerifier(clientID string) *Verifier {
	return &Verifier{clientID: clientID}
}

// Verify valida el ID Token y retorna la información del usuario de Google.
// La librería google/idtoken verifica:
//   - La firma con las claves públicas de Google
//   - La expiración del token
//   - Que el audience (aud) coincida con el clientID
func (v *Verifier) Verify(ctx context.Context, idToken string) (*UserInfo, error) {
	payload, err := idtoken.Validate(ctx, idToken, v.clientID)
	if err != nil {
		return nil, fmt.Errorf("validar google id token: %w", err)
	}

	// Extraer campos del payload con helpers tipados.
	email, _ := payload.Claims["email"].(string)
	name, _ := payload.Claims["name"].(string)
	picture, _ := payload.Claims["picture"].(string)

	if email == "" {
		return nil, fmt.Errorf("google token sin email en claims")
	}

	return &UserInfo{
		GoogleID: payload.Subject, // "sub": ID único e inmutable del usuario en Google
		Email:    email,
		Name:     name,
		Picture:  picture,
	}, nil
}
