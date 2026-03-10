package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"

	"auth-service/internal/domain"
	jwtmanager "auth-service/internal/platform/jwt"
)

// ContextKeyUserID es la clave para leer el userID del contexto de Fiber.
const ContextKeyUserID = "user_id"

// ContextKeyEmail es la clave para leer el email del contexto de Fiber.
const ContextKeyEmail = "user_email"

// RequireAuth valida el Bearer token en el header Authorization.
// Si es válido, inyecta user_id y email en el contexto para el handler.
// Si no, retorna 401 de inmediato.
func RequireAuth(jwtMgr *jwtmanager.Manager) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return respondUnauthorized(c, "header Authorization requerido")
		}

		// Espera formato: "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			return respondUnauthorized(c, "formato inválido, se espera: Bearer <token>")
		}

		claims, err := jwtMgr.Verify(parts[1])
		if err != nil {
			return respondUnauthorized(c, domain.ErrInvalidAccessToken.Error())
		}

		// Inyectar datos en el contexto, el handler los lee sin re-parsear el token.
		c.Locals(ContextKeyUserID, claims.Subject)
		c.Locals(ContextKeyEmail, claims.Email)

		return c.Next()
	}
}

func respondUnauthorized(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		"error": message,
	})
}
