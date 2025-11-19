use prometheus::{
    register_histogram_vec_with_registry, register_int_counter_vec_with_registry, Encoder,
    HistogramVec, IntCounterVec, Registry, TextEncoder,
};

#[derive(Clone)]
pub struct AppMetrics {
    pub registry: std::sync::Arc<Registry>,
    pub http_requests_total: IntCounterVec,
    pub http_request_duration: HistogramVec,
    pub cache_hits: IntCounterVec,
    pub cache_misses: IntCounterVec,
    pub cache_operation_duration: HistogramVec,
    pub db_query_duration: HistogramVec,
}

impl AppMetrics {
    pub fn new() -> Self {
        let mut default_labels = std::collections::HashMap::new();
        default_labels.insert("service".to_string(), "forecap-api-rust".to_string());

        let registry = std::sync::Arc::new(
            Registry::new_custom(Some("forecap".into()), Some(default_labels)).unwrap(),
        );

        let http_requests_total = register_int_counter_vec_with_registry!(
            "http_requests_total",
            "Total HTTP requests",
            &["method", "route", "status"],
            registry.as_ref()
        )
        .unwrap();

        let http_request_duration = register_histogram_vec_with_registry!(
            "http_request_duration_seconds",
            "HTTP request duration",
            &["method", "route", "status"],
            vec![0.01, 0.05, 0.1, 0.2, 0.5, 1.0],
            registry.as_ref()
        )
        .unwrap();

        let cache_hits = register_int_counter_vec_with_registry!(
            "cache_hits_total",
            "Cache hits",
            &["cache"],
            registry.as_ref()
        )
        .unwrap();

        let cache_misses = register_int_counter_vec_with_registry!(
            "cache_misses_total",
            "Cache misses",
            &["cache"],
            registry.as_ref()
        )
        .unwrap();

        let cache_operation_duration = register_histogram_vec_with_registry!(
            "cache_operation_duration_seconds",
            "Cache operation duration",
            &["operation"],
            vec![0.001, 0.005, 0.01, 0.05, 0.1],
            registry.as_ref()
        )
        .unwrap();

        let db_query_duration = register_histogram_vec_with_registry!(
            "db_query_duration_seconds",
            "Database query duration",
            &["operation"],
            vec![0.001, 0.005, 0.01, 0.05, 0.1],
            registry.as_ref()
        )
        .unwrap();

        Self {
            registry,
            http_requests_total,
            http_request_duration,
            cache_hits,
            cache_misses,
            cache_operation_duration,
            db_query_duration,
        }
    }

    pub fn gather(&self) -> Vec<u8> {
        let metric_families = self.registry.gather();
        let mut buffer = Vec::new();
        let encoder = TextEncoder::new();
        encoder
            .encode(&metric_families, &mut buffer)
            .expect("Failed to encode metrics");
        buffer
    }
}

