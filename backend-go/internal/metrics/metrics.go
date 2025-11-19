package metrics

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type Collector struct {
	httpRequests   *prometheus.CounterVec
	httpDuration   *prometheus.HistogramVec
	cacheHits      *prometheus.CounterVec
	cacheMisses    *prometheus.CounterVec
	dbQueryDuration *prometheus.HistogramVec
	registry       *prometheus.Registry
	serviceName    string
}

func New(serviceName string) *Collector {
	registry := prometheus.NewRegistry()

	labels := prometheus.Labels{"service": serviceName}

	httpRequests := prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name:        "http_requests_total",
			Help:        "Total HTTP requests",
			ConstLabels: labels,
		},
		[]string{"method", "route", "status"},
	)

	httpDuration := prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:        "http_request_duration_seconds",
			Help:        "HTTP request duration",
			ConstLabels: labels,
			Buckets:     []float64{0.01, 0.05, 0.1, 0.2, 0.5, 1, 2},
		},
		[]string{"method", "route", "status"},
	)

	cacheHits := prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name:        "cache_hits_total",
			Help:        "Cache hits",
			ConstLabels: labels,
		},
		[]string{"cache"},
	)

	cacheMisses := prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name:        "cache_misses_total",
			Help:        "Cache misses",
			ConstLabels: labels,
		},
		[]string{"cache"},
	)

	dbQueryDuration := prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:        "db_query_duration_seconds",
			Help:        "Database query duration",
			ConstLabels: labels,
			Buckets:     []float64{0.001, 0.005, 0.01, 0.05, 0.1, 0.5},
		},
		[]string{"operation"},
	)

	registry.MustRegister(httpRequests, httpDuration, cacheHits, cacheMisses, dbQueryDuration)

	return &Collector{
		httpRequests:    httpRequests,
		httpDuration:    httpDuration,
		cacheHits:       cacheHits,
		cacheMisses:     cacheMisses,
		dbQueryDuration: dbQueryDuration,
		registry:        registry,
		serviceName:     serviceName,
	}
}

func (c *Collector) Handler() gin.HandlerFunc {
	h := promhttp.HandlerFor(c.registry, promhttp.HandlerOpts{})
	return func(ctx *gin.Context) {
		h.ServeHTTP(ctx.Writer, ctx.Request)
	}
}

func (c *Collector) Middleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		start := time.Now()
		ctx.Next()
		status := ctx.Writer.Status()
		duration := time.Since(start).Seconds()
		method := ctx.Request.Method
		route := ctx.FullPath()
		if route == "" {
			route = ctx.Request.URL.Path
		}
		c.httpRequests.WithLabelValues(method, route, statusCode(status)).Inc()
		c.httpDuration.WithLabelValues(method, route, statusCode(status)).Observe(duration)
	}
}

func (c *Collector) CacheHit(cacheType string) {
	c.cacheHits.WithLabelValues(cacheType).Inc()
}

func (c *Collector) CacheMiss(cacheType string) {
	c.cacheMisses.WithLabelValues(cacheType).Inc()
}

func (c *Collector) ObserveDBQuery(operation string, duration time.Duration) {
	c.dbQueryDuration.WithLabelValues(operation).Observe(duration.Seconds())
}

func statusCode(code int) string {
	return strconv.Itoa(code)
}


