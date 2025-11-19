use actix_web::{http::StatusCode, HttpResponse, ResponseError};
use redis::RedisError;
use serde::Serialize;
use thiserror::Error;
use tracing::error;

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("{0}")]
    Unauthorized(String),
    #[error("{0}")]
    NotFound(String),
    #[error("Internal server error")]
    Internal(anyhow::Error),
    #[error(transparent)]
    Redis(#[from] RedisError),
}

impl ApiError {
    pub fn unauthorized(msg: &str) -> Self {
        Self::Unauthorized(msg.into())
    }

    pub fn not_found(msg: &str) -> Self {
        Self::NotFound(msg.into())
    }
}

impl ResponseError for ApiError {
    fn status_code(&self) -> StatusCode {
        match self {
            ApiError::Unauthorized(_) => StatusCode::UNAUTHORIZED,
            ApiError::NotFound(_) => StatusCode::NOT_FOUND,
            ApiError::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Redis(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        // Log errors with full details and stacktrace
        match self {
            ApiError::Internal(err) => {
                // Log the full error chain and backtrace if available
                let backtrace = err.backtrace();
                error!(
                    error = %err,
                    backtrace = %backtrace,
                    error_chain = ?err.chain().collect::<Vec<_>>(),
                    "Internal server error occurred"
                );
            }
            ApiError::Redis(err) => {
                error!(
                    error = %err,
                    "Redis error occurred"
                );
            }
            ApiError::Unauthorized(msg) => {
                error!(message = %msg, "Unauthorized request");
            }
            ApiError::NotFound(msg) => {
                error!(message = %msg, "Resource not found");
            }
        }

        HttpResponse::build(self.status_code()).json(ErrorResponse {
            error: self.to_string(),
        })
    }
}

