use actix_web::http::header::HeaderMap;
use base64::Engine;
use chrono::{DateTime, Utc};

use crate::errors::ApiError;

const MAX_ALLOWED_SKEW_MINUTES: i64 = 10;

pub fn extract_auth_headers(
    headers: &HeaderMap,
    signature_secret: Option<&str>,
) -> Result<i64, ApiError> {
    let timestamp = header_value(headers, "timestamp")?;
    let user_id_raw = header_value(headers, "user_id")?;
    let sign = header_value(headers, "sign")?;

    let user_id: i64 = user_id_raw
        .parse()
        .map_err(|_| ApiError::unauthorized("Invalid user_id"))?;

    validate_timestamp(&timestamp)?;
    validate_signature(&timestamp, &user_id_raw, &sign, signature_secret)?;

    Ok(user_id)
}

fn header_value<'a>(headers: &'a HeaderMap, key: &str) -> Result<&'a str, ApiError> {
    headers
        .get(key)
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| ApiError::unauthorized(&format!("Missing header: {key}")))
}

fn validate_timestamp(timestamp: &str) -> Result<(), ApiError> {
    let parsed: DateTime<Utc> = timestamp
        .parse()
        .map_err(|_| ApiError::unauthorized("Invalid timestamp format"))?;
    let now = Utc::now();
    let diff = now.signed_duration_since(parsed).num_minutes();
    if diff.abs() > MAX_ALLOWED_SKEW_MINUTES {
        return Err(ApiError::unauthorized(
            "Timestamp expired or too far in future (max 10 minutes)",
        ));
    }
    Ok(())
}

fn validate_signature(
    timestamp: &str,
    user_id: &str,
    provided: &str,
    signature_secret: Option<&str>,
) -> Result<(), ApiError> {
    let payload = match signature_secret {
        Some(secret) if !secret.is_empty() => format!("{timestamp}{secret}{user_id}"),
        _ => format!("{timestamp}{user_id}"),
    };
    let expected = base64::engine::general_purpose::STANDARD.encode(payload);
    if expected != provided {
        return Err(ApiError::unauthorized("Invalid signature"));
    }
    Ok(())
}

