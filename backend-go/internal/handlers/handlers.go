package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/forecap/forecap-2025/backend-go/internal/auth"
	"github.com/forecap/forecap-2025/backend-go/internal/cache"
	"github.com/forecap/forecap-2025/backend-go/internal/database"
	"github.com/forecap/forecap-2025/backend-go/internal/metrics"
)

type Handler struct {
	db        *database.Client
	cache     *cache.Client
	validator *auth.Validator
	metrics   *metrics.Collector
}

func New(db *database.Client, cacheClient *cache.Client, validator *auth.Validator, metricsCollector *metrics.Collector) *Handler {
	return &Handler{
		db:        db,
		cache:     cacheClient,
		validator: validator,
		metrics:   metricsCollector,
	}
}

func (h *Handler) RegisterRoutes(router *gin.Engine, metricsHandler gin.HandlerFunc) {
	router.GET("/health", h.Health)
	router.GET("/metrics", metricsHandler)
	router.GET("/api/user-data", h.GetUserData)
}

func (h *Handler) Health(ctx *gin.Context) {
	requestCtx := ctx.Request.Context()
	if err := h.db.Ping(requestCtx); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "mysql": err.Error()})
		return
	}
	if err := h.cache.Ping(requestCtx); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "redis": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"services": gin.H{
			"mysql": "up",
			"redis": "up",
		},
	})
}

func (h *Handler) GetUserData(ctx *gin.Context) {
	userID, err := h.validator.ValidateHeaders(ctx.Request)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	start := time.Now()
	requestCtx := ctx.Request.Context()
	if cached, err := h.cache.GetUser(requestCtx, userID); err == nil && cached != nil {
		h.metrics.CacheHit("redis")
		ctx.JSON(http.StatusOK, cached)
		return
	} else if err == nil {
		h.metrics.CacheMiss("redis")
	} else {
		h.metrics.CacheMiss("redis")
	}

	userRow, err := h.db.GetUserRecap(requestCtx, userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	h.metrics.ObserveDBQuery("get_user", time.Since(start))

	if userRow == nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	response := userRow.ToResponse()
	if err := h.cache.SetUser(requestCtx, userID, response); err != nil {
		// log but not fatal
	}

	ctx.JSON(http.StatusOK, response)
}


