use actix_web::{get, web, HttpRequest, HttpResponse};
use redis::aio::ConnectionManager;
use sqlx::MySqlPool;
use tokio::time::Instant;

use crate::{
    auth::extract_auth_headers,
    cache::{get_cached_user, set_cached_user},
    errors::ApiError,
    metrics::AppMetrics,
    models::{ServerResponse, UserRecapRow},
};
use tracing::{error, warn};

#[derive(Clone)]
pub struct AppState {
    pub pool: MySqlPool,
    pub redis: ConnectionManager,
    pub cache_ttl: u64,
    pub metrics: std::sync::Arc<AppMetrics>,
    pub auth_secret: Option<String>,
}

#[get("/api/user-data")]
pub async fn get_user_data(
    req: HttpRequest,
    state: web::Data<AppState>,
) -> Result<HttpResponse, ApiError> {
    let timer = Instant::now();
    let method = req.method().to_string();
    let route = "/api/user-data";

    let user_id = match extract_auth_headers(
        req.headers(),
        state.auth_secret.as_deref(),
    ) {
        Ok(id) => id,
        Err(e) => {
            error!(error = %e, user_id = ?req.headers().get("user_id"), "Authentication failed");
            return Err(e);
        }
    };

    let mut redis_conn = state.redis.clone();

    if let Some(cached) = get_cached_user(&mut redis_conn, user_id).await? {
        state
            .metrics
            .cache_hits
            .with_label_values(&["redis"])
            .inc();
    observe_http(&state.metrics, &method, route, 200, timer.elapsed());
        return Ok(HttpResponse::Ok().json(cached));
    }
    state
        .metrics
        .cache_misses
        .with_label_values(&["redis"])
        .inc();

    let db_timer = Instant::now();
    let row = fetch_user_from_db(&state.pool, user_id).await?;
    state
        .metrics
        .db_query_duration
        .with_label_values(&["get_user"])
        .observe(db_timer.elapsed().as_secs_f64());

    if let Some(row) = row {
        let response: ServerResponse = row.into();
        if let Err(e) = set_cached_user(
            &mut redis_conn,
            user_id,
            &response,
            state.cache_ttl,
        )
        .await
        {
            warn!(
                user_id = user_id,
                error = %e,
                "Failed to cache user data (non-fatal)"
            );
            // Continue even if caching fails
        }

        observe_http(&state.metrics, &method, route, 200, timer.elapsed());
        return Ok(HttpResponse::Ok().json(response));
    }

    observe_http(&state.metrics, &method, route, 404, timer.elapsed());
    Err(ApiError::not_found("User not found"))
}

#[get("/health")]
pub async fn health(
    req: HttpRequest,
    state: web::Data<AppState>,
) -> Result<HttpResponse, ApiError> {
    let timer = Instant::now();
    let method = req.method().to_string();
    let route = "/health";

    sqlx::query_scalar::<_, i32>("SELECT 1")
        .fetch_one(&state.pool)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    let mut conn = state.redis.clone();
    redis::cmd("PING")
        .query_async::<_, String>(&mut conn)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    observe_http(&state.metrics, &method, route, 200, timer.elapsed());

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "services": {
            "mysql": "up",
            "redis": "up"
        }
    })))
}

#[get("/metrics")]
pub async fn metrics(
    req: HttpRequest,
    state: web::Data<AppState>,
) -> HttpResponse {
    let timer = Instant::now();
    let method = req.method().to_string();
    let route = "/metrics";

    let body = state.metrics.gather();
    let body_str = String::from_utf8(body).unwrap_or_else(|_| String::new());
    
    observe_http(&state.metrics, &method, route, 200, timer.elapsed());

    HttpResponse::Ok()
        .content_type("text/plain; version=0.0.4; charset=utf-8")
        .body(body_str)
}

async fn fetch_user_from_db(
    pool: &MySqlPool,
    user_id: i64,
) -> Result<Option<UserRecapRow>, ApiError> {
    let row = sqlx::query_as::<_, UserRecapRow>(
        r#"
        SELECT
          user_id,
          user_name,
          trx_count,
          variant_count,
          total_point,
          total_point_description,
          total_point_possible_redeem,
          total_point_image,
          delivery_count,
          pickup_count,
          cheaper_subs_desc,
          cheaper_subs_amount,
          top_ranking,
          list_circular_images,
          list_product_favorite,
          list_favorite_store,
          created_at,
          updated_at
        FROM user_recap_data
        WHERE user_id = ?
        "#,
    )   
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| {
        let err = anyhow::anyhow!("Database query failed for user {}: {}", user_id, e)
            .context(format!("User ID: {}", user_id));
        ApiError::Internal(err)
    })?;

    Ok(row)
}

fn observe_http(app_metrics: &AppMetrics, method: &str, route: &str, status: u16, duration: std::time::Duration) {
    let status_str = status.to_string();
    app_metrics
        .http_requests_total
        .with_label_values(&[method, route, &status_str])
        .inc();
    app_metrics
        .http_request_duration
        .with_label_values(&[method, route, &status_str])
        .observe(duration.as_secs_f64());
}

