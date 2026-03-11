# Auth Service

Microservicio de autenticación para el sistema de la Universidad Nacional de Colombia. Gestiona el login con Google OAuth, emisión de JWTs (RS256) y manejo de sesiones con refresh tokens.

Solo se permiten cuentas con dominio `@unal.edu.co`.

## Stack

- **Lenguaje:** Go 1.22
- **Framework HTTP:** Fiber v2
- **Base de datos:** PostgreSQL 16
- **Autenticación:** Google OAuth 2.0 (ID Token)
- **Tokens:** JWT RS256 (access) + token opaco SHA-256 (refresh)

## Desarrollo local

### Requisitos

- Go 1.22+
- PostgreSQL 16 corriendo localmente
- OpenSSL
- Una cuenta en [Google Cloud Console](https://console.cloud.google.com)

### 1. Generar claves RSA

Las claves se generan una sola vez y **nunca se suben al repositorio**.

```bash
mkdir keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
```

### 2. Obtener el Google Client ID

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Navega a **APIs y servicios → Credenciales**
3. **Crear credenciales → ID de cliente OAuth 2.0**, tipo: Aplicación web
4. En "Orígenes autorizados de JavaScript" agrega `http://localhost:3000` (puerto del frontend)
5. Copia el **Client ID** generado

> Antes de crear las credenciales, Google pedirá configurar la pantalla de consentimiento OAuth. Selecciona modo "Externo" y añade tu cuenta `@unal.edu.co` como usuario de prueba.

### 3. Variables de entorno

```bash
cp .env.example .env
# editar .env con tus valores reales
```

El `.env` tiene dos URLs de base de datos:

- `DATABASE_URL`, apunta a `localhost`, se usa al correr el servicio localmente con `go run`
- `DOCKER_DATABASE_URL`, apunta al nombre del servicio (`postgres`), la usa el `docker-compose` del proyecto

El `.env` solo es necesario para desarrollo local. En Docker, las variables las inyecta el `docker-compose` del proyecto directamente, `godotenv` las ignora si no encuentra el archivo.

### 4. Correr migraciones

```bash
psql -U tu_usuario -d auth_db -f migrations/001_create_users.sql
psql -U tu_usuario -d auth_db -f migrations/002_create_refresh_tokens.sql
```

### 5. Levantar el servicio

```bash
go mod tidy
go run cmd/main.go
```

El servicio queda disponible en `http://localhost:4000`.

## Despliegue con Docker

Este servicio forma parte del `docker-compose` del proyecto general. Las variables de entorno se gestionan desde el `.env` en la raíz del proyecto, y la variable `DATABASE_URL` del contenedor se asigna desde `DOCKER_DATABASE_URL` para apuntar al servicio de PostgreSQL dentro de la red Docker.

Las migraciones corren automáticamente al crear el volumen de PostgreSQL por primera vez, gracias al volumen montado en `/docker-entrypoint-initdb.d`.

## Endpoints

### `POST /auth/google`
Inicia sesión con un Google ID Token. Si el usuario no existe, se crea automáticamente.

```json
// Request
{ "id_token": "token-de-google" }

// Response 200
{
  "access_token": "eyJ...",
  "refresh_token": "a3f9...",
  "expires_in": 900
}
```

| Error | Código |
|-------|--------|
| Token de Google inválido | 401 |
| Dominio no permitido (no es @unal.edu.co) | 403 |

---

### `POST /auth/refresh`
Renueva el access token. El refresh token usado queda revocado y se emite uno nuevo.

```json
// Request
{ "refresh_token": "a3f9..." }

// Response 200
{
  "access_token": "eyJ...",
  "refresh_token": "b7c2...",
  "expires_in": 900
}
```

> Si se detecta un refresh token revocado siendo reutilizado, se revocan todas las sesiones activas del usuario.

---

### `POST /auth/logout`
Cierra la sesión revocando el refresh token.

```json
// Request
{ "refresh_token": "a3f9..." }

// Response 200
{ "message": "sesión cerrada correctamente" }
```

---

### `GET /auth/me`
Retorna los datos del usuario autenticado.

```
Authorization: Bearer eyJ...
```

```json
// Response 200
{
  "id": "uuid",
  "email": "usuario@unal.edu.co",
  "name": "Nombre Apellido",
  "picture": "https://..."
}
```

---

### `GET /.well-known/jwks.json`
Expone la clave pública RSA para que otros microservicios verifiquen los JWTs sin consultar este servicio.

---

### `GET /health`
Health check.

```json
{ "status": "ok" }
```

## Cómo validan los JWT los otros microservicios

Solo necesitan la clave pública (`keys/public.pem`) o consumir `/.well-known/jwks.json`. Con eso verifican la firma localmente sin llamar al auth service.

El payload del JWT contiene:

```json
{
  "sub": "uuid-del-usuario",
  "email": "usuario@unal.edu.co",
  "exp": 1710000000,
  "iat": 1709990000
}
```

## Estructura del proyecto

```
auth-service/
├── cmd/main.go                        # Entry point y wiring de dependencias
├── configs/config.go                  # Carga de variables de entorno
├── internal/
│   ├── domain/                        # Modelos y contratos de negocio
│   │   ├── user.go
│   │   ├── refresh_token.go
│   │   ├── errors.go
│   │   └── repositories.go            # Interfaces de repositorios
│   ├── platform/                      # Integraciones externas
│   │   ├── google/verifier.go         # Verificación de Google ID Tokens
│   │   └── jwt/manager.go             # Firma y verificación de JWTs RS256
│   ├── repository/                    # Implementaciones PostgreSQL
│   │   ├── user_repository.go
│   │   └── token_repository.go
│   ├── service/auth_service.go        # Lógica de negocio
│   └── handler/auth_handler.go        # Capa HTTP
├── pkg/
│   ├── database/postgres.go           # Pool de conexiones
│   └── middleware/auth_middleware.go  # Validación de Bearer token
├── migrations/
│   ├── 001_create_users.sql
│   └── 002_create_refresh_tokens.sql
├── docker/
│   └── postgres/Dockerfile            # Imagen PostgreSQL con pg_uuidv7
└── keys/                              # Claves RSA, no se suben al repo
```

## Duración de los tokens

| Token | Duración | Configurable en |
|-------|----------|-----------------|
| Access token (JWT) | 15 minutos | `ACCESS_TOKEN_TTL` |
| Refresh token | 7 días | `REFRESH_TOKEN_TTL` |

## Seguridad

- Los refresh tokens se almacenan como hash SHA-256, el valor original nunca toca la base de datos.
- Los JWTs usan RS256 (asimétrico), los otros microservicios solo necesitan la clave pública para verificar.
- La clave privada RSA nunca sale del auth service.
- Un refresh token revocado que se intenta reutilizar provoca la revocación de todas las sesiones del usuario.
- Los tokens expirados se limpian automáticamente cada 24 horas.
