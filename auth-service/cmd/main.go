package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"

	"auth-service/configs"
	"auth-service/internal/handler"
	"auth-service/internal/platform/google"
	jwtmanager "auth-service/internal/platform/jwt"
	"auth-service/internal/repository"
	"auth-service/internal/service"
	"auth-service/pkg/database"
	"auth-service/pkg/middleware"
)

func main() {
	// Cargar .env en desarrollo (en producción las vars vienen del entorno).
	if err := godotenv.Load(); err != nil {
		log.Println("sin archivo .env, usando variables de entorno del sistema")
	}

	// 1. Configuración.
	cfg := configs.Load()

	// 2. Base de datos.
	ctx := context.Background()
	pool, err := database.NewPool(ctx, database.DefaultConfig(cfg.DatabaseURL))
	if err != nil {
		log.Fatalf("conectar a PostgreSQL: %v", err)
	}
	defer pool.Close()
	log.Println("PostgreSQL conectado")

	// 3. Plataforma (JWT y Google).
	jwtMgr, err := jwtmanager.NewManager(
		cfg.JWTPrivateKeyPath,
		cfg.JWTPublicKeyPath,
		cfg.AccessTokenTTL,
	)
	if err != nil {
		log.Fatalf("inicializar JWT manager: %v", err)
	}
	log.Println("JWT manager listo")

	googleVerif := google.NewVerifier(cfg.GoogleClientID)

	// 4. Repositorios.
	userRepo := repository.NewUserRepository(pool)
	tokenRepo := repository.NewTokenRepository(pool)

	// 5. Service.
	// Contexto cancelable para el cleanup worker, se cancela en el shutdown.
	svcCtx, svcCancel := context.WithCancel(ctx)
	defer svcCancel()

	authSvc := service.NewAuthService(cfg, userRepo, tokenRepo, jwtMgr, googleVerif)
	authSvc.StartCleanupWorker(svcCtx)

	// 6. Fiber app.
	app := fiber.New(fiber.Config{
		// No exponer stack traces en errores 500.
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "error interno del servidor",
			})
		},
	})

	// Middlewares globales.
	app.Use(recover.New()) // recuperar panics sin bajar el servidor
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} ${method} ${path} ${latency}\n",
	}))

	// 7. Rutas.
	authHandler := handler.NewAuthHandler(authSvc)
	authHandler.RegisterRoutes(app, middleware.RequireAuth(jwtMgr))

	// Endpoint JWKS: expone la clave pública para otros microservicios.
	app.Get("/.well-known/jwks.json", func(c *fiber.Ctx) error {
		pubKey := jwtMgr.PublicKey()
		return c.JSON(fiber.Map{
			"keys": []fiber.Map{
				{
					"kty": "RSA",
					"use": "sig",
					"alg": "RS256",
					"n":   pubKey.N.String(),
					"e":   pubKey.E,
				},
			},
		})
	})

	// Health check (útil para Docker).
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// 8. Arranque con graceful shutdown.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Printf("Auth service escuchando en :%s\n", cfg.Port)
		if err := app.Listen(":" + cfg.Port); err != nil {
			log.Fatalf("error al arrancar servidor: %v", err)
		}
	}()

	<-quit
	log.Println("apagando servidor...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := app.ShutdownWithContext(shutdownCtx); err != nil {
		log.Printf("error en shutdown: %v", err)
	}

	log.Println("servidor apagado correctamente")
}
