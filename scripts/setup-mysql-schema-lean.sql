-- Lean MySQL Schema Setup for Forecap 2025 User Recap Data
-- Single table design with JSON columns for better performance and lower cost

-- Create database
CREATE DATABASE IF NOT EXISTS forecap_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE forecap_db;

-- Single table for all user recap data
CREATE TABLE IF NOT EXISTS user_recap_data (
    user_id INT UNSIGNED NOT NULL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    trx_count INT UNSIGNED NOT NULL DEFAULT 0,
    variant_count INT UNSIGNED DEFAULT NULL,
    total_point INT UNSIGNED DEFAULT NULL,
    total_point_description TEXT DEFAULT NULL,
    total_point_possible_redeem INT UNSIGNED DEFAULT NULL,
    total_point_image VARCHAR(500) DEFAULT NULL,
    delivery_count INT UNSIGNED DEFAULT NULL,
    pickup_count INT UNSIGNED DEFAULT NULL,
    cheaper_subs_desc VARCHAR(100) DEFAULT NULL,
    cheaper_subs_amount DECIMAL(12,2) DEFAULT NULL,
    top_ranking INT UNSIGNED DEFAULT NULL,
    list_circular_images JSON DEFAULT NULL,
    list_product_favorite JSON DEFAULT NULL,
    list_favorite_store JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for common queries
    INDEX idx_trx_count (trx_count),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY HASH(user_id) PARTITIONS 16;

-- Optimize InnoDB settings (run these after table creation)
-- SET GLOBAL innodb_buffer_pool_size = 24G;  -- Adjust based on available RAM
-- SET GLOBAL innodb_log_file_size = 2G;
-- SET GLOBAL innodb_flush_log_at_trx_commit = 2;

-- Create a user for the application (optional, for security)
-- CREATE USER IF NOT EXISTS 'forecap_app'@'%' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE ON forecap_db.* TO 'forecap_app'@'%';
-- FLUSH PRIVILEGES;

