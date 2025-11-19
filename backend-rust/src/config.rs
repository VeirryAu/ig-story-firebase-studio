use std::env;
use urlencoding::encode;

#[derive(Debug, Clone)]
pub struct Config {
    pub mysql_host: String,
    pub mysql_port: u16,
    pub mysql_user: String,
    pub mysql_password: String,
    pub mysql_database: String,
    pub redis_url: String,
    pub port: u16,
    pub auth_signature_secret: Option<String>,
    pub cache_ttl_seconds: u64,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        dotenvy::dotenv().ok();
        Ok(Self {
            mysql_host: env::var("MYSQL_HOST").unwrap_or_else(|_| "localhost".into()),
            mysql_port: env::var("MYSQL_PORT")
                .ok()
                .and_then(|p| p.parse().ok())
                .unwrap_or(3306),
            mysql_user: env::var("MYSQL_USER").unwrap_or_else(|_| "root".into()),
            mysql_password: env::var("MYSQL_PASSWORD").unwrap_or_default(),
            mysql_database: env::var("MYSQL_DATABASE").unwrap_or_else(|_| "forecap_db".into()),
            redis_url: env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".into()),
            port: env::var("PORT")
                .ok()
                .and_then(|p| p.parse().ok())
                .unwrap_or(4000),
            auth_signature_secret: env::var("AUTH_SIGNATURE_SECRET").ok(),
            cache_ttl_seconds: env::var("CACHE_TTL_SECONDS")
                .ok()
                .and_then(|p| p.parse().ok())
                .unwrap_or(3600),
        })
    }

    pub fn mysql_url(&self) -> String {
        // URL-encode password in case it contains special characters
        // For local Docker MySQL, SSL is typically not required
        format!(
            "mysql://{}:{}@{}:{}/{}",
            encode(&self.mysql_user),
            encode(&self.mysql_password),
            self.mysql_host,
            self.mysql_port,
            self.mysql_database
        )
    }
}

