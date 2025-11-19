package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/joho/godotenv"

	"github.com/forecap/forecap-2025/backend-go/internal/auth"
	"github.com/forecap/forecap-2025/backend-go/internal/cache"
	"github.com/forecap/forecap-2025/backend-go/internal/config"
	"github.com/forecap/forecap-2025/backend-go/internal/database"
	"github.com/forecap/forecap-2025/backend-go/internal/handlers"
	"github.com/forecap/forecap-2025/backend-go/internal/metrics"
)

func main() {
	_ = godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	dbClient, err := database.New(cfg.MySQLDSN, 30)
	if err != nil {
		log.Fatalf("failed to connect to mysql: %v", err)
	}
	defer dbClient.Close()

	redisClient := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
	})
	defer redisClient.Close()

	cacheClient := cache.NewClient(redisClient, cfg.CacheTTL)
	authValidator := auth.NewValidator(cfg.AuthSignatureSecret)
	metricsCollector := metrics.New(cfg.ServiceName)

	handler := handlers.New(dbClient, cacheClient, authValidator, metricsCollector)

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(metricsCollector.Middleware())

	handler.RegisterRoutes(router, metricsCollector.Handler())

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	go func() {
		log.Printf("Go backend listening on %s", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	if err := server.Shutdown(context.Background()); err != nil {
		log.Fatalf("server shutdown error: %v", err)
	}
}


