package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port               string
	MySQLDSN           string
	RedisAddr          string
	RedisPassword      string
	CacheTTL           time.Duration
	AuthSignatureSecret string
	ServiceName        string
}

func Load() (*Config, error) {
	port := getEnv("PORT", "4001")
	mysqlHost := getEnv("MYSQL_HOST", "localhost")
	mysqlPort := getEnv("MYSQL_PORT", "3306")
	mysqlUser := getEnv("MYSQL_USER", "root")
	mysqlPassword := getEnv("MYSQL_PASSWORD", "")
	mysqlDatabase := getEnv("MYSQL_DATABASE", "forecap_db")

	dsn := mysqlUser + ":" + mysqlPassword + "@tcp(" + mysqlHost + ":" + mysqlPort + ")/" + mysqlDatabase + "?parseTime=true&charset=utf8mb4&loc=UTC"

	redisHost := getEnv("REDIS_HOST", "localhost")
	redisPort := getEnv("REDIS_PORT", "6379")
	redisPassword := getEnv("REDIS_PASSWORD", "")

	cacheTTLSeconds := 3600
	if v := os.Getenv("CACHE_TTL_SECONDS"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil {
			cacheTTLSeconds = parsed
		}
	}

	return &Config{
		Port:               port,
		MySQLDSN:           dsn,
		RedisAddr:          redisHost + ":" + redisPort,
		RedisPassword:      redisPassword,
		CacheTTL:           time.Duration(cacheTTLSeconds) * time.Second,
		AuthSignatureSecret: os.Getenv("AUTH_SIGNATURE_SECRET"),
		ServiceName:        getEnv("SERVICE_NAME", "forecap-api-go"),
	}, nil
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}


