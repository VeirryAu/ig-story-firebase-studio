#!/usr/bin/env python3
"""
Script to import Excel file (BigQuery results) to MySQL database
Usage: python import-excel-to-mysql.py <excel_file_path>
"""

import pandas as pd
import mysql.connector
from mysql.connector import pooling, Error
import redis
import json
import sys
import os
from typing import Dict, List, Any
from datetime import datetime

# Configuration
DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'database': os.getenv('MYSQL_DATABASE', 'forecap_db'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'pool_name': 'recap_pool',
    'pool_size': 10
}

REDIS_CONFIG = {
    'host': os.getenv('REDIS_HOST', 'localhost'),
    'port': int(os.getenv('REDIS_PORT', 6379)),
    'db': 0
}

BATCH_SIZE = 10000
CACHE_TTL = 3600  # 1 hour

def create_connection_pool():
    """Create MySQL connection pool"""
    try:
        pool = pooling.MySQLConnectionPool(**DB_CONFIG)
        print(f"✓ Connection pool created: {DB_CONFIG['pool_name']}")
        return pool
    except Error as e:
        print(f"✗ Error creating connection pool: {e}")
        sys.exit(1)

def get_redis_client():
    """Get Redis client"""
    try:
        client = redis.Redis(**REDIS_CONFIG, decode_responses=False)
        client.ping()
        print(f"✓ Redis connection established: {REDIS_CONFIG['host']}:{REDIS_CONFIG['port']}")
        return client
    except Exception as e:
        print(f"✗ Error connecting to Redis: {e}")
        return None

def parse_json_field(value):
    """Parse JSON field from Excel (handles string or actual JSON)"""
    if pd.isna(value) or value == '':
        return None
    if isinstance(value, str):
        try:
            return json.loads(value)
        except:
            return None
    return value

def insert_user_recap(cursor, row: pd.Series):
    """Insert main user recap data"""
    cursor.execute("""
        INSERT INTO user_recap_data (
            user_id, user_name, trx_count, variant_count,
            total_point, total_point_description, total_point_possible_redeem,
            total_point_image, delivery_count, pickup_count,
            cheaper_subs_desc, cheaper_subs_amount, top_ranking,
            list_circular_images
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        ON DUPLICATE KEY UPDATE
            user_name = VALUES(user_name),
            trx_count = VALUES(trx_count),
            variant_count = VALUES(variant_count),
            total_point = VALUES(total_point),
            total_point_description = VALUES(total_point_description),
            total_point_possible_redeem = VALUES(total_point_possible_redeem),
            total_point_image = VALUES(total_point_image),
            delivery_count = VALUES(delivery_count),
            pickup_count = VALUES(pickup_count),
            cheaper_subs_desc = VALUES(cheaper_subs_desc),
            cheaper_subs_amount = VALUES(cheaper_subs_amount),
            top_ranking = VALUES(top_ranking),
            list_circular_images = VALUES(list_circular_images),
            updated_at = CURRENT_TIMESTAMP
    """, (
        int(row['user_id']),
        str(row.get('user_name', '')),
        int(row.get('trx_count', 0)),
        int(row['variant_count']) if pd.notna(row.get('variant_count')) else None,
        int(row['total_point']) if pd.notna(row.get('total_point')) else None,
        str(row['total_point_description']) if pd.notna(row.get('total_point_description')) else None,
        int(row['total_point_possible_redeem']) if pd.notna(row.get('total_point_possible_redeem')) else None,
        str(row['total_point_image']) if pd.notna(row.get('total_point_image')) else None,
        int(row['delivery_count']) if pd.notna(row.get('delivery_count')) else None,
        int(row['pickup_count']) if pd.notna(row.get('pickup_count')) else None,
        str(row['cheaper_subs_desc']) if pd.notna(row.get('cheaper_subs_desc')) else None,
        float(row['cheaper_subs_amount']) if pd.notna(row.get('cheaper_subs_amount')) else None,
        int(row['top_ranking']) if pd.notna(row.get('top_ranking')) else None,
        json.dumps(row['list_circular_images']) if pd.notna(row.get('list_circular_images')) else None
    ))

def insert_favorite_products(cursor, user_id: int, products: List[Dict[str, Any]]):
    """Insert favorite products for a user"""
    if not products:
        return
    
    # Delete existing products
    cursor.execute("DELETE FROM user_favorite_products WHERE user_id = %s", (user_id,))
    
    # Insert new products
    for idx, product in enumerate(products):
        cursor.execute("""
            INSERT INTO user_favorite_products
            (user_id, product_name, count_cups, product_image, display_order)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            user_id,
            product.get('productName', ''),
            int(product.get('countCups', 0)),
            product.get('productImage', ''),
            idx
        ))

def insert_favorite_stores(cursor, user_id: int, stores: List[Dict[str, Any]]):
    """Insert favorite stores for a user"""
    if not stores:
        return
    
    # Delete existing stores
    cursor.execute("DELETE FROM user_favorite_stores WHERE user_id = %s", (user_id,))
    
    # Insert new stores
    for idx, store in enumerate(stores):
        cursor.execute("""
            INSERT INTO user_favorite_stores
            (user_id, store_name, transaction_count, store_image, display_order)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            user_id,
            store.get('storeName', ''),
            int(store.get('transactionCount', 0)),
            store.get('storeImage', ''),
            idx
        ))

def cache_user_data(redis_client, user_id: int, data: Dict[str, Any]):
    """Cache user data in Redis"""
    if not redis_client:
        return
    
    try:
        cache_key = f"user:recap:{user_id}"
        redis_client.setex(
            cache_key,
            CACHE_TTL,
            json.dumps(data)
        )
    except Exception as e:
        print(f"Warning: Failed to cache user {user_id}: {e}")

def process_batch(pool, redis_client, batch_df: pd.DataFrame):
    """Process a batch of rows"""
    conn = pool.get_connection()
    cursor = conn.cursor()
    
    success_count = 0
    error_count = 0
    
    try:
        conn.start_transaction()
        
        for idx, row in batch_df.iterrows():
            try:
                user_id = int(row['user_id'])
                
                # Insert main recap data
                insert_user_recap(cursor, row)
                
                # Insert favorite products
                products = parse_json_field(row.get('listProductFavorite'))
                if products:
                    insert_favorite_products(cursor, user_id, products)
                
                # Insert favorite stores
                stores = parse_json_field(row.get('listFavoriteStore'))
                if stores:
                    insert_favorite_stores(cursor, user_id, stores)
                
                success_count += 1
                
            except Exception as e:
                error_count += 1
                print(f"Error processing user_id {row.get('user_id', 'unknown')}: {e}")
                continue
        
        conn.commit()
        print(f"  ✓ Batch committed: {success_count} success, {error_count} errors")
        
    except Exception as e:
        conn.rollback()
        print(f"  ✗ Batch failed: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()
    
    return success_count, error_count

def main():
    if len(sys.argv) < 2:
        print("Usage: python import-excel-to-mysql.py <excel_file_path>")
        sys.exit(1)
    
    excel_path = sys.argv[1]
    
    if not os.path.exists(excel_path):
        print(f"✗ File not found: {excel_path}")
        sys.exit(1)
    
    print(f"Reading Excel file: {excel_path}")
    try:
        df = pd.read_excel(excel_path)
        print(f"✓ Loaded {len(df)} rows")
    except Exception as e:
        print(f"✗ Error reading Excel file: {e}")
        sys.exit(1)
    
    # Create connections
    pool = create_connection_pool()
    redis_client = get_redis_client()
    
    # Process in batches
    total_success = 0
    total_errors = 0
    start_time = datetime.now()
    
    print(f"\nProcessing {len(df)} rows in batches of {BATCH_SIZE}...")
    
    for i in range(0, len(df), BATCH_SIZE):
        batch = df.iloc[i:i+BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        total_batches = (len(df) + BATCH_SIZE - 1) // BATCH_SIZE
        
        print(f"\nBatch {batch_num}/{total_batches} ({i+1}-{min(i+BATCH_SIZE, len(df))})")
        
        try:
            success, errors = process_batch(pool, redis_client, batch)
            total_success += success
            total_errors += errors
        except Exception as e:
            print(f"✗ Fatal error in batch {batch_num}: {e}")
            break
    
    elapsed = datetime.now() - start_time
    
    print(f"\n{'='*60}")
    print(f"Import completed!")
    print(f"  Total rows: {len(df)}")
    print(f"  Success: {total_success}")
    print(f"  Errors: {total_errors}")
    print(f"  Time elapsed: {elapsed}")
    print(f"  Rate: {total_success / elapsed.total_seconds():.2f} rows/second")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()

