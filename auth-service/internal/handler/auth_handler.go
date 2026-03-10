package handler

import (
	"errors"

	"github.com/gofiber/fiber/v2"

	"auth-service/internal/domain"
	"auth-service/internal/service"
)

// AuthHandler gestiona las rutas HTTP del servicio de autenticación.
type AuthHandler struct {
	svc *service.AuthService
}

// NewAuthHandler crea un handler con el service inyectado.
func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

// RegisterRoutes registra todos los endpoints en la app de Fiber.
func (h *AuthHandler) RegisterRoutes(app *fiber.App, jwtMgr interface {
	Verify(string) (interface{}, error)
}) {
	auth := app.Group("/auth")

	auth.Post("/google", h.LoginWithGoogle)
	auth.Post("/refresh", h.Refresh)
	auth.Post("/logout", h.Logout)
	auth.Get("/me", h.Me)
}

// Request / Response types

type loginRequest struct {
	IDToken string `json:"id_token"`
}

type authResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token,omitempty"`
	ExpiresIn    int    `json:"expires_in"`
}

type refreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type logoutRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// Handlers

// LoginWithGoogle godoc
// POST /auth/google
// Body: { "id_token": "..." }
func (h *AuthHandler) LoginWithGoogle(c *fiber.Ctx) error {
	var req loginRequest
	if err := c.BodyParser(&req); err != nil || req.IDToken == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id_token requerido",
		})
	}

	result, err := h.svc.LoginWithGoogle(c.Context(), service.LoginInput{
		IDToken:   req.IDToken,
		UserAgent: c.Get("User-Agent"),
		IPAddress: c.IP(),
	})
	if err != nil {
		return h.mapError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(authResponse{
		AccessToken:  result.AccessToken,
		RefreshToken: result.RefreshToken,
		ExpiresIn:    result.ExpiresIn,
	})
}

// Refresh godoc
// POST /auth/refresh
// Body: { "refresh_token": "..." }
func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	var req refreshRequest
	if err := c.BodyParser(&req); err != nil || req.RefreshToken == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "refresh_token requerido",
		})
	}

	result, err := h.svc.RefreshSession(c.Context(), req.RefreshToken)
	if err != nil {
		return h.mapError(c, err)
	}

	// En el refresh solo devolvemos el nuevo access token y el nuevo refresh token.
	return c.Status(fiber.StatusOK).JSON(authResponse{
		AccessToken:  result.AccessToken,
		RefreshToken: result.RefreshToken,
		ExpiresIn:    result.ExpiresIn,
	})
}

// Logout godoc
// POST /auth/logout
// Body: { "refresh_token": "..." }
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	var req logoutRequest
	if err := c.BodyParser(&req); err != nil || req.RefreshToken == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "refresh_token requerido",
		})
	}

	if err := h.svc.Logout(c.Context(), req.RefreshToken); err != nil {
		return h.mapError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "sesión cerrada correctamente",
	})
}

// Me godoc
// GET /auth/me
// Header: Authorization: Bearer <access_token>
func (h *AuthHandler) Me(c *fiber.Ctx) error {
	// El middleware ya validó el token e inyectó el accessToken en locals.
	// Leemos el token raw del header para pasárselo al service.
	accessToken := extractBearer(c.Get("Authorization"))
	if accessToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "token requerido",
		})
	}

	userInfo, err := h.svc.GetCurrentUser(c.Context(), accessToken)
	if err != nil {
		return h.mapError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"id":      userInfo.ID,
		"email":   userInfo.Email,
		"name":    userInfo.Name,
		"picture": userInfo.Picture,
	})
}

// Helpers

// mapError traduce errores de dominio a respuestas HTTP.
// El service no sabe nada de HTTP — esta es la única capa que lo hace.
func (h *AuthHandler) mapError(c *fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, domain.ErrInvalidGoogleToken):
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})

	case errors.Is(err, domain.ErrDomainNotAllowed):
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})

	case errors.Is(err, domain.ErrInvalidRefreshToken):
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})

	case errors.Is(err, domain.ErrInvalidAccessToken):
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})

	case errors.Is(err, domain.ErrUserNotFound):
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})

	default:
		// Error inesperado, sin detalles internos al cliente.
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "error interno del servidor",
		})
	}
}

func extractBearer(header string) string {
	if len(header) > 7 && header[:7] == "Bearer " {
		return header[7:]
	}
	return ""
}
