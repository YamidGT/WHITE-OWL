package domain

import (
	"time"

	"github.com/google/uuid"
)

// User representa un usuario autenticado del sistema.
// Solo se admiten cuentas con dominio @unal.edu.co.
type User struct {
	ID        uuid.UUID `db:"id"`
	Email     string    `db:"email"`
	Name      string    `db:"name"`
	GoogleID  string    `db:"google_id"`
	Picture   string    `db:"picture"`
	LastLogin time.Time `db:"last_login"`
	CreatedAt time.Time `db:"created_at"`
}

// HasDomain verifica que el email pertenece al dominio dado.
// La responsabilidad de qué dominio es válido recae en el service,
// que lo obtiene de configs.
func (u *User) HasDomain(domain string) bool {
	if len(u.Email) < len(domain) {
		return false
	}
	return u.Email[len(u.Email)-len(domain):] == domain
}
