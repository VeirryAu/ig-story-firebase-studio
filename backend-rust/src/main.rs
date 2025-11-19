mod auth;
mod cache;
mod config;
mod errors;
mod handlers;
mod metrics;
mod models;

use actix_web::{middleware::Logger, web, App, HttpServer};
use config::Config;
use handlers::{metrics as metrics_handler, health, get_user_data, AppState};
use metrics::AppMetrics;
use redis::aio::ConnectionManager;
use sqlx::mysql::MySqlPoolOptions;
use sqlx::MySqlPool;
use std::time::Duration;
use tokio::time::sleep;
use tracing::{info, warn};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let config = Config::from_env().expect("Failed to load configuration");
    info!("Starting Rust backend with config: {:?}", config);
    info!("MySQL URL: mysql://{}:***@{}:{}/{}", 
          config.mysql_user, config.mysql_host, config.mysql_port, config.mysql_database);

    // Retry MySQL connection with exponential backoff
    let pool = retry_mysql_connection(&config, 5).await;

    let redis_client = redis::Client::open(config.redis_url.clone()).expect("Invalid REDIS_URL");
    let redis_manager = ConnectionManager::new(redis_client)
        .await
        .expect("Failed to connect to Redis");

    let metrics = std::sync::Arc::new(AppMetrics::new());

    let state = AppState {
        pool,
        redis: redis_manager,
        cache_ttl: config.cache_ttl_seconds,
        metrics: metrics.clone(),
        auth_secret: config.auth_signature_secret.clone(),
    };

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .app_data(web::Data::new(state.clone()))
            .service(get_user_data)
            .service(health)
            .service(metrics_handler)
    })
    .bind(("0.0.0.0", config.port))?
    .run()
    .await
}

async fn retry_mysql_connection(config: &Config, max_retries: u32) -> MySqlPool {
    let mut retries = 0;
    loop {
        match MySqlPoolOptions::new()
            .max_connections(30)
            .acquire_timeout(Duration::from_secs(5))
            .connect(&config.mysql_url())
            .await
        {
            Ok(pool) => {
                info!("Successfully connected to MySQL");
                return pool;
            }
            Err(e) => {
                retries += 1;
                if retries >= max_retries {
                    panic!("Failed to connect to MySQL after {} retries: {}", max_retries, e);
                }
                let delay = Duration::from_secs(2_u64.pow(retries));
                warn!(
                    "Failed to connect to MySQL (attempt {}/{}): {}. Retrying in {:?}...",
                    retries, max_retries, e, delay
                );
                sleep(delay).await;
            }
        }
    }
}

