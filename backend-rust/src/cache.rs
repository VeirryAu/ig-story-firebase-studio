use redis::aio::ConnectionManager;
use redis::AsyncCommands;
use serde_json::json;

use crate::models::ServerResponse;

const CACHE_KEY_PREFIX: &str = "user:recap:";

pub async fn get_cached_user(
    redis: &mut ConnectionManager,
    user_id: i64,
) -> redis::RedisResult<Option<ServerResponse>> {
    let key = format!("{CACHE_KEY_PREFIX}{user_id}");
    let cached: Option<String> = redis.get(key).await?;
    if let Some(value) = cached {
        Ok(serde_json::from_str(&value).ok())
    } else {
        Ok(None)
    }
}

pub async fn set_cached_user(
    redis: &mut ConnectionManager,
    user_id: i64,
    data: &ServerResponse,
    ttl_seconds: u64,
) -> redis::RedisResult<()> {
    let key = format!("{CACHE_KEY_PREFIX}{user_id}");
    let payload = serde_json::to_string(data).unwrap_or_else(|_| json!({}).to_string());
    let _: () = redis
        .set_ex(key, payload, ttl_seconds)
        .await?;
    Ok(())
}

