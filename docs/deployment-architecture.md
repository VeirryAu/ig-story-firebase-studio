# Deployment Architecture for 1M Users (Dec 8-31, 2025)

## Overview
This document outlines the recommended architecture for serving ~1 million active users over 24 days (Dec 8-31, 2025) with MySQL as the primary data store and Redis for caching.

## Traffic Estimates

- **Total Users**: ~1,000,000 active users
- **Duration**: 24 days (Dec 8-31, 2025)
- **Peak Daily Users**: ~42,000 users/day (assuming uniform distribution)
- **Peak Hourly Users**: ~3,500 users/hour (assuming 12-hour active window)
- **Requests per User**: ~2-3 API calls (initial load + potential retries)
- **Peak RPS**: ~1,000-1,500 requests/second (worst case)

## Architecture Recommendation

### 1. MySQL Database Design

#### Schema Design

```sql
-- Main user recap data table
CREATE TABLE user_recap_data (
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
    
    -- Indexes
    INDEX idx_trx_count (trx_count),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY HASH(user_id) PARTITIONS 16;

-- Favorite products (one-to-many)
CREATE TABLE user_favorite_products (
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

-- Favorite stores (one-to-many)
CREATE TABLE user_favorite_stores (
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
```

#### Key Design Decisions

1. **Partitioning**: Hash partitioning by `user_id` across 16 partitions for better query distribution
2. **Primary Key**: `user_id` as PRIMARY KEY for O(1) lookups
3. **JSON Column**: `list_circular_images` stored as JSON for flexibility
4. **Separate Tables**: Normalized design for products/stores to avoid JSON bloat
5. **Indexes**: Strategic indexes on frequently queried fields

### 2. Redis Caching Strategy

#### Cache Key Design

```
user:recap:{user_id}                    # Full user recap data (JSON)
user:recap:{user_id}:ttl                # TTL tracking key
user:recap:{user_id}:lock               # Distributed lock for cache warming
```

#### Caching Implementation

```typescript
// Cache configuration
const CACHE_CONFIG = {
  TTL: 3600,                    // 1 hour TTL
  LOCK_TTL: 10,                 // 10 seconds lock timeout
  CACHE_PREFIX: 'user:recap:',
  MAX_MEMORY: '2gb',            // Redis max memory
  EVICTION_POLICY: 'allkeys-lru' // LRU eviction
};

// Cache-aside pattern
async function getUserRecap(userId: number): Promise<ServerResponse> {
  const cacheKey = `${CACHE_CONFIG.CACHE_PREFIX}${userId}`;
  
  // 1. Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 2. Check for lock (another request is fetching)
  const lockKey = `${cacheKey}:lock`;
  const lock = await redis.set(lockKey, '1', 'EX', CACHE_CONFIG.LOCK_TTL, 'NX');
  
  if (!lock) {
    // Wait briefly and retry cache
    await sleep(100);
    const retryCache = await redis.get(cacheKey);
    if (retryCache) return JSON.parse(retryCache);
  }
  
  // 3. Fetch from database
  const data = await fetchFromDatabase(userId);
  
  // 4. Store in cache
  await redis.setex(cacheKey, CACHE_CONFIG.TTL, JSON.stringify(data));
  
  // 5. Release lock
  await redis.del(lockKey);
  
  return data;
}
```

#### Redis Configuration

```yaml
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
save ""  # Disable persistence for pure cache
tcp-backlog 511
timeout 0
tcp-keepalive 300
```

### 3. Data Loading Strategy

#### Option A: Batch Import (Recommended for Initial Load)

```python
# Python script for batch import
import pandas as pd
import mysql.connector
from mysql.connector import pooling
import redis
import json

# Database connection pool
db_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="recap_pool",
    pool_size=10,
    host="mysql-host",
    database="forecap_db",
    user="user",
    password="password"
)

# Redis connection
redis_client = redis.Redis(host='redis-host', port=6379, db=0)

def load_excel_to_mysql(excel_path):
    """Load Excel file and import to MySQL in batches"""
    df = pd.read_excel(excel_path)
    
    # Process in batches of 10,000
    batch_size = 10000
    for i in range(0, len(df), batch_size):
        batch = df.iloc[i:i+batch_size]
        insert_batch(batch)
        print(f"Processed {i+batch_size}/{len(df)} rows")

def insert_batch(batch_df):
    """Insert batch with transaction"""
    conn = db_pool.get_connection()
    cursor = conn.cursor()
    
    try:
        conn.start_transaction()
        
        for _, row in batch_df.iterrows():
            # Insert main record
            cursor.execute("""
                INSERT INTO user_recap_data 
                (user_id, user_name, trx_count, ...)
                VALUES (%s, %s, %s, ...)
                ON DUPLICATE KEY UPDATE
                    user_name = VALUES(user_name),
                    trx_count = VALUES(trx_count),
                    ...
            """, (row['user_id'], row['user_name'], row['trx_count'], ...))
            
            # Insert favorite products
            if pd.notna(row['listProductFavorite']):
                products = json.loads(row['listProductFavorite'])
                for idx, product in enumerate(products):
                    cursor.execute("""
                        INSERT INTO user_favorite_products
                        (user_id, product_name, count_cups, product_image, display_order)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (row['user_id'], product['productName'], 
                          product['countCups'], product['productImage'], idx))
            
            # Insert favorite stores
            if pd.notna(row['listFavoriteStore']):
                stores = json.loads(row['listFavoriteStore'])
                for idx, store in enumerate(stores):
                    cursor.execute("""
                        INSERT INTO user_favorite_stores
                        (user_id, store_name, transaction_count, store_image, display_order)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (row['user_id'], store['storeName'],
                          store['transactionCount'], store['storeImage'], idx))
        
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()
```

#### Option B: LOAD DATA INFILE (Fastest for Large Datasets)

```sql
-- Prepare CSV from Excel
-- Then use MySQL's native import

LOAD DATA INFILE '/path/to/user_recap_data.csv'
INTO TABLE user_recap_data
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(user_id, user_name, trx_count, ...);
```

### 4. API Endpoint Design

```typescript
// Next.js API Route: /api/user-data
import { NextApiRequest, NextApiResponse } from 'next';
import { validateAuthHeaders } from '@/lib/auth';
import { getUserRecap } from '@/lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate authentication
  const authResult = validateAuthHeaders(req.headers);
  if (!authResult.valid) {
    return res.status(401).json({ error: authResult.error });
  }

  const userId = parseInt(req.headers['user_id'] as string);
  
  try {
    // Get from cache/database
    const userData = await getUserRecap(userId);
    
    // Return response
    return res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 5. Deployment Architecture

#### Recommended Setup

```
┌─────────────────┐
│  CloudFlare CDN │  (Static assets, DDoS protection)
└────────┬────────┘
         │
┌────────▼────────┐
│  Load Balancer  │  (AWS ALB / GCP LB / CloudFlare)
└────────┬────────┘
         │
    ┌────┴────┐
    │        │
┌───▼───┐ ┌──▼───┐
│ App 1 │ │ App 2│  (Next.js API servers, 2-4 instances)
└───┬───┘ └───┬──┘
    │         │
    └────┬────┘
         │
    ┌────▼────┐
    │ Redis  │  (Redis Cluster: 3-6 nodes, 2GB each)
    │ Cluster │
    └────┬────┘
         │
    ┌────▼────┐
    │ MySQL  │  (MySQL Master + 2 Read Replicas)
    │ Cluster │
    └─────────┘
```

#### Infrastructure Specifications

**Application Servers (Next.js)**
- **Instances**: 2-4 instances (auto-scaling: 2-8)
- **Size**: 2 vCPU, 4GB RAM each
- **Platform**: AWS ECS / GCP Cloud Run / Vercel Pro
- **Connection Pooling**: 20 connections per instance

**MySQL Database**
- **Primary**: db.r5.xlarge (4 vCPU, 32GB RAM)
- **Read Replicas**: 2x db.r5.large (2 vCPU, 16GB RAM each)
- **Storage**: 500GB SSD with auto-scaling
- **Backup**: Daily automated backups
- **Connection Pool**: 100 max connections

**Redis Cluster**
- **Nodes**: 3-6 nodes (1 master, 2-5 replicas)
- **Size**: cache.r6g.large (2 vCPU, 13GB RAM each)
- **Memory**: 2GB per node (6-12GB total)
- **Persistence**: Disabled (pure cache)

### 6. Performance Optimizations

#### Database Optimizations

```sql
-- Connection pooling
SET GLOBAL max_connections = 500;
SET GLOBAL thread_cache_size = 50;
SET GLOBAL query_cache_size = 0;  -- Disable query cache (use Redis instead)

-- InnoDB optimizations
SET GLOBAL innodb_buffer_pool_size = 24G;  -- 75% of RAM
SET GLOBAL innodb_log_file_size = 2G;
SET GLOBAL innodb_flush_log_at_trx_commit = 2;  -- Better performance
```

#### Application Optimizations

1. **Connection Pooling**: Use `mysql2` with connection pooling
2. **Query Optimization**: Use prepared statements, batch queries
3. **Response Compression**: Enable gzip/brotli compression
4. **HTTP/2**: Enable HTTP/2 for multiplexing
5. **CDN**: Cache static assets on CloudFlare

### 7. Monitoring & Alerting

#### Key Metrics to Monitor

- **Database**: Query latency, connection pool usage, replication lag
- **Redis**: Hit rate, memory usage, eviction rate
- **Application**: Response time (p50, p95, p99), error rate, RPS
- **Infrastructure**: CPU, memory, network I/O

#### Alert Thresholds

- Database query time > 100ms
- Redis hit rate < 80%
- Error rate > 1%
- CPU usage > 80% for 5 minutes

### 8. Cost Estimation (AWS Example)

- **Application**: 4x t3.medium = ~$120/month
- **MySQL**: db.r5.xlarge + 2x db.r5.large = ~$800/month
- **Redis**: 3x cache.r6g.large = ~$300/month
- **Load Balancer**: ALB = ~$20/month
- **Total**: ~$1,240/month (~$0.0012 per user)

### 9. Alternative: Serverless Approach (Lower Cost)

If cost is a concern, consider:

- **Vercel/Netlify**: Host Next.js app (free tier available)
- **PlanetScale**: Serverless MySQL (auto-scaling)
- **Upstash Redis**: Serverless Redis (pay-per-request)
- **Estimated Cost**: ~$200-400/month

### 10. Migration Checklist

- [ ] Create MySQL schema with partitions
- [ ] Set up Redis cluster
- [ ] Write data import script
- [ ] Test with sample data (1K, 10K, 100K users)
- [ ] Implement caching layer
- [ ] Set up monitoring
- [ ] Load test (use k6 or Artillery)
- [ ] Deploy to staging
- [ ] Full data import
- [ ] Deploy to production

## Recommended Approach

**For 1M users over 24 days, I recommend:**

1. ✅ **MySQL with partitioning** - Handles scale, easy to query
2. ✅ **Redis caching** - Reduces DB load by 80-90%
3. ✅ **Read replicas** - Distribute read load
4. ✅ **Connection pooling** - Efficient resource usage
5. ✅ **Batch import** - Load data once, serve many times

This architecture can easily handle 1M users and scale to 10M+ if needed.

