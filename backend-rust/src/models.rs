use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use rust_decimal::Decimal;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ServerResponse {
    #[serde(rename = "userName")]
    pub user_name: String,
    #[serde(rename = "trxCount")]
    pub trx_count: i64,
    #[serde(rename = "variantCount", skip_serializing_if = "Option::is_none")]
    pub variant_count: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_point: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "totalPointDescription")]
    pub total_point_description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "totalPointPossibleRedeem")]
    pub total_point_possible_redeem: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "totalPointImage")]
    pub total_point_image: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "deliveryCount")]
    pub delivery_count: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "pickupCount")]
    pub pickup_count: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "cheaperSubsDesc")]
    pub cheaper_subs_desc: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "cheaperSubsAmount")]
    pub cheaper_subs_amount: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "topRanking")]
    pub top_ranking: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "listCircularImages")]
    pub list_circular_images: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "listProductFavorite")]
    pub list_product_favorite: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "listFavoriteStore")]
    pub list_favorite_store: Option<Value>,
}

#[derive(sqlx::FromRow, Debug)]
pub struct UserRecapRow {
    pub user_id: i64,  // INT UNSIGNED in MySQL
    pub user_name: String,
    pub trx_count: u32,  // INT UNSIGNED in MySQL
    pub variant_count: Option<u32>,  // INT UNSIGNED in MySQL
    pub total_point: Option<u32>,  // INT UNSIGNED in MySQL
    pub total_point_description: Option<String>,
    pub total_point_possible_redeem: Option<u32>,  // INT UNSIGNED in MySQL
    pub total_point_image: Option<String>,
    pub delivery_count: Option<u32>,  // INT UNSIGNED in MySQL
    pub pickup_count: Option<u32>,  // INT UNSIGNED in MySQL
    pub cheaper_subs_desc: Option<String>,
    pub cheaper_subs_amount: Option<Decimal>,  // DECIMAL(12,2) in MySQL
    pub top_ranking: Option<u32>,  // INT UNSIGNED in MySQL
    pub list_circular_images: Option<Value>,
    pub list_product_favorite: Option<Value>,
    pub list_favorite_store: Option<Value>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl From<UserRecapRow> for ServerResponse {
    fn from(row: UserRecapRow) -> Self {
        Self {
            user_name: row.user_name,
            trx_count: row.trx_count as i64,  // Convert u32 to i64 for API response
            variant_count: row.variant_count.map(|v| v as i32),  // Convert u32 to i32
            total_point: row.total_point.map(|v| v as i64),  // Convert u32 to i64
            total_point_description: row.total_point_description,
            total_point_possible_redeem: row.total_point_possible_redeem.map(|v| v as i32),  // Convert u32 to i32
            total_point_image: row.total_point_image,
            delivery_count: row.delivery_count.map(|v| v as i32),  // Convert u32 to i32
            pickup_count: row.pickup_count.map(|v| v as i32),  // Convert u32 to i32
            cheaper_subs_desc: row.cheaper_subs_desc,
            cheaper_subs_amount: row.cheaper_subs_amount.map(|v| v.to_string().parse::<f64>().unwrap_or(0.0)),  // Convert Decimal to f64
            top_ranking: row.top_ranking.map(|v| v as i32),  // Convert u32 to i32
            list_circular_images: row
                .list_circular_images
                .and_then(|v| serde_json::from_value(v).ok()),
            list_product_favorite: row.list_product_favorite,
            list_favorite_store: row.list_favorite_store,
        }
    }
}

