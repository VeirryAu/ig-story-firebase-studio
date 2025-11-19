/**
 * Database utilities for fetching user recap data
 * Uses MySQL with Redis caching
 */

import mysql from 'mysql2/promise';
import Redis from 'ioredis';

// Configuration
const DB_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  database: process.env.MYSQL_DATABASE || 'forecap_db',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
};

const CACHE_TTL = 3600; // 1 hour
const CACHE_PREFIX = 'user:recap:';
const LOCK_TTL = 10; // 10 seconds

// Connection pools
let dbPool: mysql.Pool | null = null;
let redisClient: Redis | null = null;

/**
 * Initialize database connection pool
 */
export function initDatabase() {
  if (!dbPool) {
    dbPool = mysql.createPool(DB_CONFIG);
    console.log('✓ MySQL connection pool created');
  }
  return dbPool;
}

/**
 * Initialize Redis client
 */
export function initRedis() {
  if (!redisClient) {
    redisClient = new Redis(REDIS_CONFIG);
    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });
    console.log('✓ Redis client connected');
  }
  return redisClient;
}

/**
 * Get database pool (lazy initialization)
 */
function getDbPool(): mysql.Pool {
  if (!dbPool) {
    return initDatabase();
  }
  return dbPool;
}

/**
 * Get Redis client (lazy initialization)
 */
function getRedis(): Redis | null {
  if (!redisClient) {
    try {
      return initRedis();
    } catch (error) {
      console.error('Redis initialization failed, continuing without cache:', error);
      return null;
    }
  }
  return redisClient;
}

/**
 * Fetch user recap data from database
 */
async function fetchFromDatabase(userId: number): Promise<any> {
  const pool = getDbPool();
  
  try {
    // Fetch main user data
    const [userRows] = await pool.execute(
      `SELECT 
        user_id,
        user_name as userName,
        trx_count as trxCount,
        variant_count as variantCount,
        total_point as totalPoint,
        total_point_description as totalPointDescription,
        total_point_possible_redeem as totalPointPossibleRedeem,
        total_point_image as totalPointImage,
        delivery_count as deliveryCount,
        pickup_count as pickupCount,
        cheaper_subs_desc as cheaperSubsDesc,
        cheaper_subs_amount as cheaperSubsAmount,
        top_ranking as topRanking,
        list_circular_images as listCircularImages
      FROM user_recap_data
      WHERE user_id = ?`,
      [userId]
    );
    
    const userData = (userRows as any[])[0];
    if (!userData) {
      return null;
    }
    
    // Fetch favorite products
    const [productRows] = await pool.execute(
      `SELECT 
        product_name as productName,
        count_cups as countCups,
        product_image as productImage
      FROM user_favorite_products
      WHERE user_id = ?
      ORDER BY display_order ASC
      LIMIT 10`,
      [userId]
    );
    
    // Fetch favorite stores
    const [storeRows] = await pool.execute(
      `SELECT 
        store_name as storeName,
        transaction_count as transactionCount,
        store_image as storeImage
      FROM user_favorite_stores
      WHERE user_id = ?
      ORDER BY display_order ASC
      LIMIT 3`,
      [userId]
    );
    
    // Parse JSON fields
    if (userData.listCircularImages) {
      try {
        userData.listCircularImages = JSON.parse(userData.listCircularImages);
      } catch {
        userData.listCircularImages = null;
      }
    }
    
    // Combine results
    return {
      ...userData,
      listProductFavorite: productRows as any[],
      listFavoriteStore: storeRows as any[],
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get user recap data with caching (cache-aside pattern)
 */
export async function getUserRecap(userId: number): Promise<any> {
  const redis = getRedis();
  const cacheKey = `${CACHE_PREFIX}${userId}`;
  const lockKey = `${cacheKey}:lock`;
  
  // 1. Try cache first
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Redis get error:', error);
      // Continue to database if cache fails
    }
  }
  
  // 2. Try to acquire lock (prevent cache stampede)
  let hasLock = false;
  if (redis) {
    try {
      const lockResult = await redis.set(lockKey, '1', 'EX', LOCK_TTL, 'NX');
      hasLock = lockResult === 'OK';
      
      // If lock exists, wait briefly and retry cache
      if (!hasLock) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const retryCache = await redis.get(cacheKey);
        if (retryCache) {
          return JSON.parse(retryCache);
        }
      }
    } catch (error) {
      console.error('Redis lock error:', error);
      // Continue to database if lock fails
    }
  }
  
  // 3. Fetch from database
  const data = await fetchFromDatabase(userId);
  
  if (!data) {
    // Release lock if we have it
    if (redis && hasLock) {
      await redis.del(lockKey).catch(() => {});
    }
    return null;
  }
  
  // 4. Store in cache
  if (redis) {
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
    } catch (error) {
      console.error('Redis set error:', error);
      // Continue even if cache fails
    }
  }
  
  // 5. Release lock
  if (redis && hasLock) {
    await redis.del(lockKey).catch(() => {});
  }
  
  return data;
}

/**
 * Invalidate cache for a user
 */
export async function invalidateUserCache(userId: number): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  
  try {
    const cacheKey = `${CACHE_PREFIX}${userId}`;
    await redis.del(cacheKey);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

/**
 * Close database connections (for graceful shutdown)
 */
export async function closeConnections(): Promise<void> {
  if (dbPool) {
    await dbPool.end();
    dbPool = null;
  }
  
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

