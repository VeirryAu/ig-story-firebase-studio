-- MySQL Schema Setup for Forecap 2025 User Recap Data
-- Run this script to create the database schema

-- Create database
CREATE DATABASE IF NOT EXISTS forecap_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE forecap_db;

-- Main user recap data table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for common queries
    INDEX idx_trx_count (trx_count),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY HASH(user_id) PARTITIONS 16;

-- Favorite products (one-to-many relationship)
CREATE TABLE IF NOT EXISTS user_favorite_products (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    count_cups INT UNSIGNED NOT NULL,
    product_image VARCHAR(500) DEFAULT NULL,
    display_order INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_user_order (user_id, display_order),
    FOREIGN KEY (user_id) REFERENCES user_recap_data(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY HASH(user_id) PARTITIONS 16;

-- Favorite stores (one-to-many relationship)
CREATE TABLE IF NOT EXISTS user_favorite_stores (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    store_name VARCHAR(255) NOT NULL,
    transaction_count INT UNSIGNED NOT NULL,
    store_image VARCHAR(500) DEFAULT NULL,
    display_order INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_user_order (user_id, display_order),
    FOREIGN KEY (user_id) REFERENCES user_recap_data(user_id) ON DELETE CASCADE
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

