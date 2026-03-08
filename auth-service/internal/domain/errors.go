package domain

import "errors"

// Errores de dominio que el service retorna y el handler mapea a HTTP.
var (
	ErrInvalidGoogleToken  = errors.New("google id token inválido o expirado")
	ErrDomainNotAllowed    = errors.New("solo se permiten cuentas @unal.edu.co")
	ErrInvalidRefreshToken = errors.New("refresh token inválido, expirado o revocado")
	ErrUserNotFound        = errors.New("usuario no encontrado")
	ErrInvalidAccessToken  = errors.New("access token inválido o expirado")
)
