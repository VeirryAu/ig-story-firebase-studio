# Performance Optimization Guide

**For 3M Users (Dec 8-31, 2025)**  
**Read-Heavy Workload with MyISAM + Redis**

---

## Table of Contents

1. [Application-Level Optimizations](#application-level-optimizations)
2. [Database Optimizations](#database-optimizations)
3. [Caching Strategies](#caching-strategies)
4. [Infrastructure Optimizations](#infrastructure-optimizations)
5. [Code-Level Best Practices](#code-level-best-practices)
6. [Monitoring & Profiling](#monitoring--profiling)
7. [Quick Wins Checklist](#quick-wins-checklist)

---

## Application-Level Optimizations

### 1. Connection Pooling

**Current Setup:**
- MySQL: 20-30 connections
- Redis: Single connection (consider pool)

**Optimizations:**

```typescript
// backend/src/database/database.service.ts
// Increase pool size for high concurrency
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  connectionLimit: 50,  // Increase from 20-30
  queueLimit: 100,       // Queue requests when pool is full
  acquireTimeout: 60000, // 60s timeout
  timeout: 10000,        // 10s query timeout
  reconnect: true,
  idleTimeout: 300000,  // 5min idle timeout
});
```

**Redis Connection Pool:**
```typescript
// Use connection pool for Redis (ioredis supports this)
const redis = new Redis({
  host: process.env.REDIS_HOST,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  // Connection pool
  family: 4, // IPv4
  keepAlive: 30000,
});
```

**Benefits:**
- Handle 500+ concurrent requests
- Reduce connection overhead
- Better resource utilization

---

### 2. Query Optimization

**Current Query:**
```sql
SELECT * FROM user_recap_data WHERE user_id = ?
```

**Optimizations:**

1. **Select Only Needed Columns** (if not using all fields):
```typescript
// Only select what you need
const query = `
  SELECT 
    user_id, user_name, trx_count, 
    total_point, list_circular_images
  FROM user_recap_data 
  WHERE user_id = ?
`;
```

2. **Use Prepared Statements** (already doing this ✅):
```typescript
// Always use prepared statements
const [rows] = await pool.execute(query, [userId]);
```

3. **Batch Queries** (for bulk operations):
```typescript
// Batch insert/update
const values = users.map(u => [u.id, u.name, ...]);
await pool.query(
  'INSERT INTO user_recap_data (user_id, user_name, ...) VALUES ?',
  [values]
);
```

---

### 3. Response Compression

**Enable Gzip/Brotli Compression:**

```typescript
// backend/src/main.ts
import compression from 'compression';

app.use(compression({
  level: 6,        // Compression level (1-9)
  threshold: 1024, // Only compress > 1KB
  filter: (req, res) => {
    // Compress JSON responses
    return res.getHeader('content-type')?.includes('application/json');
  }
}));
```

**Benefits:**
- 60-80% reduction in response size
- Faster network transfer
- Lower bandwidth costs

---

### 4. HTTP/2 Support

**Enable HTTP/2** (if using Node.js with HTTP/2):

```typescript
// Use HTTP/2 for multiplexing
import http2 from 'http2';

const server = http2.createServer(options, app);
```

**Benefits:**
- Multiplexing (multiple requests over one connection)
- Header compression
- Server push (optional)

---

### 5. Response Caching Headers

**Add Cache Headers:**

```typescript
// backend/src/user/user.controller.ts
@Get('/api/user-data')
@Header('Cache-Control', 'public, max-age=3600') // 1 hour
@Header('ETag', 'user-data-etag')
async getUserData(@Headers() headers: any) {
  // ... existing code
}
```

**Benefits:**
- Browser/CDN caching
- Reduced server load
- Faster client-side responses

---

## Database Optimizations

### 1. MyISAM-Specific Optimizations

**Current Settings:**
```ini
key_buffer_size=2G
query_cache_size=128M
```

**Additional Optimizations:**

```sql
-- Increase key buffer if you have more RAM
SET GLOBAL key_buffer_size = 4G;  -- If you have 8GB+ RAM

-- Optimize query cache
SET GLOBAL query_cache_type = 1;
SET GLOBAL query_cache_size = 256M;  -- Increase for more cache hits
SET GLOBAL query_cache_limit = 4M;   -- Larger cached queries

-- Optimize read buffers
SET GLOBAL read_buffer_size = 4M;      -- For sequential scans
SET GLOBAL read_rnd_buffer_size = 16M; -- For random reads
```

**Table Optimization:**
```sql
-- Optimize table (defragment, rebuild indexes)
OPTIMIZE TABLE user_recap_data;

-- Analyze table (update statistics)
ANALYZE TABLE user_recap_data;
```

---

### 2. Index Optimization

**Current Indexes:**
- Primary key on `user_id` ✅

**Additional Indexes (if needed):**
```sql
-- If you query by other fields
CREATE INDEX idx_trx_count ON user_recap_data(trx_count);
CREATE INDEX idx_updated_at ON user_recap_data(updated_at);

-- Composite index (if querying multiple fields)
CREATE INDEX idx_user_trx ON user_recap_data(user_id, trx_count);
```

**Note:** For MyISAM, indexes are stored in key buffer. Ensure `key_buffer_size` is large enough.

---

### 3. Query Cache Tuning

**Monitor Query Cache:**
```sql
SHOW STATUS LIKE 'Qcache%';
```

**Key Metrics:**
- `Qcache_hits`: Number of cache hits
- `Qcache_inserts`: Number of queries inserted
- `Qcache_hit_rate = Qcache_hits / (Qcache_hits + Qcache_inserts)`

**Target:** >80% hit rate

**Optimization:**
```sql
-- If hit rate is low, increase cache size
SET GLOBAL query_cache_size = 512M;

-- If hit rate is high but cache is full, increase limit
SET GLOBAL query_cache_limit = 8M;
```

---

### 4. Connection Management

**Optimize Connection Settings:**
```ini
[mysqld]
# Connection settings
max_connections=500
thread_cache_size=128
table_open_cache=2000
table_definition_cache=1400

# Reduce connection overhead
interactive_timeout=600
wait_timeout=600
```

---

## Caching Strategies

### 1. Redis Cache Optimization

**Current Setup:**
- TTL: 1 hour (3600 seconds)
- Cache-aside pattern ✅

**Optimizations:**

1. **Pre-warm Cache** (load popular users):
```typescript
// backend/src/scripts/prewarm-cache.ts
async function prewarmCache() {
  const popularUsers = await db.query(`
    SELECT user_id FROM user_recap_data 
    ORDER BY trx_count DESC 
    LIMIT 10000
  `);
  
  for (const user of popularUsers) {
    const data = await getUserRecap(user.user_id);
    await redis.setex(`user:recap:${user.user_id}`, 3600, JSON.stringify(data));
  }
}
```

2. **Cache Warming on Startup:**
```typescript
// backend/src/app.module.ts
@Module({})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    // Pre-warm cache with top 10K users
    await this.preWarmCache();
  }
}
```

3. **Adaptive TTL** (longer for popular users):
```typescript
// Longer TTL for high-traffic users
const ttl = user.trx_count > 100 ? 7200 : 3600; // 2h vs 1h
await redis.setex(key, ttl, JSON.stringify(data));
```

---

### 2. Multi-Level Caching

**Strategy:**
```
Request → Memory Cache (Node.js) → Redis → MySQL
```

**Implementation:**
```typescript
// In-memory cache (Node.js Map)
const memoryCache = new Map<string, { data: any; expires: number }>();

async function getUserData(userId: string) {
  // Level 1: Memory cache (fastest)
  const cached = memoryCache.get(userId);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  
  // Level 2: Redis cache
  const redisData = await redis.get(`user:recap:${userId}`);
  if (redisData) {
    const data = JSON.parse(redisData);
    // Store in memory cache
    memoryCache.set(userId, { data, expires: Date.now() + 60000 }); // 1min
    return data;
  }
  
  // Level 3: Database
  const dbData = await db.getUserRecap(userId);
  // Cache in Redis and memory
  await redis.setex(`user:recap:${userId}`, 3600, JSON.stringify(dbData));
  memoryCache.set(userId, { data: dbData, expires: Date.now() + 60000 });
  return dbData;
}
```

**Benefits:**
- Memory cache: <1ms response
- Redis cache: <5ms response
- Database: 10-50ms response

---

### 3. Cache Invalidation Strategy

**Current:** TTL-based expiration ✅

**Additional Strategies:**

1. **Write-Through Cache:**
```typescript
// Update cache when data changes
async function updateUserData(userId: string, data: any) {
  await db.updateUserRecap(userId, data);
  // Update cache immediately
  await redis.setex(`user:recap:${userId}`, 3600, JSON.stringify(data));
}
```

2. **Cache Tags** (for batch invalidation):
```typescript
// Tag cache entries
await redis.sadd(`tag:popular`, `user:recap:${userId}`);

// Invalidate all popular users
const keys = await redis.smembers('tag:popular');
await redis.del(...keys);
```

---

## Infrastructure Optimizations

### 1. Horizontal Scaling

**Current:** Single instance

**Optimization:** Multiple instances behind load balancer

```
Load Balancer (ALB/NLB)
    ↓
┌─────────┬─────────┬─────────┐
│ API 1   │ API 2   │ API 3   │
│ :3000   │ :3001   │ :3002   │
└────┬────┴────┬────┴────┬────┘
     │         │         │
     └────┬────┴────┬────┘
          │         │
    ┌─────▼─────┬───▼─────┐
    │  MySQL    │  Redis  │
    │  (RDS)    │ (Cluster)│
    └───────────┴──────────┘
```

**Benefits:**
- Handle 3x more traffic
- Fault tolerance
- Zero-downtime deployments

---

### 2. Database Read Replicas

**Setup:**
```
Primary MySQL (Writes)
    ↓
Read Replica 1 (Reads)
Read Replica 2 (Reads)
```

**Implementation:**
```typescript
// Use read replica for SELECT queries
const readPool = mysql.createPool({
  host: process.env.MYSQL_READ_REPLICA_HOST,
  // ... read pool config
});

// Use primary for writes
const writePool = mysql.createPool({
  host: process.env.MYSQL_PRIMARY_HOST,
  // ... write pool config
});
```

**Benefits:**
- Distribute read load
- 2-3x read capacity
- Better performance under load

---

### 3. Redis Cluster

**Current:** Single Redis instance

**Optimization:** Redis Cluster (3+ nodes)

```
Redis Cluster
├── Node 1 (Master)
├── Node 2 (Master)
├── Node 3 (Master)
└── Replicas (1 per master)
```

**Benefits:**
- Higher availability
- Better performance (sharding)
- Fault tolerance

---

### 4. CDN for Static Assets

**Setup CloudFlare/CDN:**
- Cache static assets (images, CSS, JS)
- Reduce origin server load
- Faster global delivery

**Configuration:**
```nginx
# Nginx/CDN config
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

### 5. Auto-Scaling

**AWS Auto Scaling Configuration:**

```yaml
# Auto Scaling Group
MinSize: 10
MaxSize: 30
DesiredCapacity: 20

# Scaling Policies
ScaleUp: CPU > 70% for 5min
ScaleDown: CPU < 30% for 15min
```

**Benefits:**
- Automatic scaling during peak hours
- Cost optimization (scale down during off-peak)
- Handle traffic spikes

---

## Code-Level Best Practices

### 1. Async/Await Optimization

**Avoid Blocking Operations:**
```typescript
// ❌ Bad: Blocking
const data = fs.readFileSync('file.json');

// ✅ Good: Non-blocking
const data = await fs.promises.readFile('file.json');
```

**Use Promise.all for Parallel Operations:**
```typescript
// ❌ Bad: Sequential
const user = await getUser(userId);
const orders = await getOrders(userId);
const points = await getPoints(userId);

// ✅ Good: Parallel
const [user, orders, points] = await Promise.all([
  getUser(userId),
  getOrders(userId),
  getPoints(userId),
]);
```

---

### 2. Error Handling

**Fail Fast:**
```typescript
// Validate early
if (!userId || userId <= 0) {
  throw new BadRequestException('Invalid user ID');
}

// Check cache before database
const cached = await redis.get(key);
if (cached) return JSON.parse(cached);
```

**Graceful Degradation:**
```typescript
// If Redis fails, continue to database
try {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
} catch (error) {
  // Log error but continue
  logger.warn('Redis error, falling back to database', error);
}
```

---

### 3. Memory Management

**Avoid Memory Leaks:**
```typescript
// Clear large objects
const largeData = await fetchLargeData();
// Process data
processData(largeData);
// Clear reference
largeData = null;
```

**Use Streaming for Large Responses:**
```typescript
// Stream large JSON responses
response.writeHead(200, { 'Content-Type': 'application/json' });
response.write('[');
for (const item of items) {
  response.write(JSON.stringify(item) + ',');
}
response.write(']');
response.end();
```

---

### 4. Database Query Optimization

**Use Indexes:**
```sql
-- Ensure indexes exist
EXPLAIN SELECT * FROM user_recap_data WHERE user_id = 12345;
-- Should show: key: PRIMARY, rows: 1
```

**Avoid N+1 Queries:**
```typescript
// ❌ Bad: N+1 queries
for (const userId of userIds) {
  const user = await db.getUser(userId);
}

// ✅ Good: Single query
const users = await db.getUsersByIds(userIds);
```

---

### 5. Response Size Optimization

**Minimize JSON Response:**
```typescript
// Remove null/undefined fields
function cleanResponse(data: any) {
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v != null)
  );
}
```

**Use Compression:**
```typescript
// Already enabled compression ✅
// Ensure large responses are compressed
```

---

## Monitoring & Profiling

### 1. Application Performance Monitoring (APM)

**Key Metrics to Track:**
- Response time (p50, p95, p99)
- Request rate (RPS)
- Error rate
- Database query time
- Cache hit rate
- Memory usage
- CPU usage

**Tools:**
- Prometheus + Grafana (already set up ✅)
- New Relic / Datadog (optional)
- Application logs

---

### 2. Database Monitoring

**MySQL Metrics:**
```sql
-- Query performance
SHOW STATUS LIKE 'Slow_queries';
SHOW STATUS LIKE 'Questions';

-- Connection usage
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';

-- MyISAM-specific
SHOW STATUS LIKE 'Key_reads';
SHOW STATUS LIKE 'Key_buffer%';
SHOW STATUS LIKE 'Qcache%';
```

**Target Metrics:**
- Query time: <10ms (p95)
- Key reads: <1% (most from memory)
- Query cache hit rate: >80%
- Connection usage: <80% of max

---

### 3. Redis Monitoring

**Key Metrics:**
```bash
# Redis CLI
INFO stats
INFO memory
INFO clients

# Key metrics
- hit_rate = hits / (hits + misses)
- memory_usage
- evicted_keys
- connected_clients
```

**Target Metrics:**
- Hit rate: >85%
- Memory usage: <80% of max
- Evicted keys: <1% (if evicting, increase memory)

---

### 4. Profiling

**Node.js Profiling:**
```bash
# CPU profiling
node --prof app.js
node --prof-process isolate-*.log

# Memory profiling
node --inspect app.js
# Use Chrome DevTools
```

**Database Profiling:**
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 0.1; -- 100ms

-- Analyze slow queries
mysqldumpslow /var/log/mysql/slow.log
```

---

## Quick Wins Checklist

### Immediate (Do Now)

- [ ] **Increase connection pool** to 50 connections
- [ ] **Enable response compression** (gzip/brotli)
- [ ] **Add cache headers** to responses
- [ ] **Pre-warm cache** with top 10K users
- [ ] **Optimize MySQL key_buffer_size** (if more RAM available)
- [ ] **Monitor query cache hit rate** (target >80%)

### Short-term (This Week)

- [ ] **Set up auto-scaling** (10-30 instances)
- [ ] **Add database read replicas** (if write load is low)
- [ ] **Implement multi-level caching** (memory + Redis)
- [ ] **Add CDN** for static assets
- [ ] **Profile slow queries** and optimize
- [ ] **Set up alerting** for key metrics

### Long-term (This Month)

- [ ] **Migrate to Redis Cluster** (if single instance is bottleneck)
- [ ] **Implement adaptive TTL** (longer for popular users)
- [ ] **Add database connection pooling** at infrastructure level
- [ ] **Optimize response size** (remove null fields)
- [ ] **Set up APM** (New Relic/Datadog)
- [ ] **Load test at production scale** (300-400 concurrent users)

---

## Performance Targets

### For 3M Users (Dec 8-31)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Response Time (p95)** | <20ms | 11.78ms (NestJS) | ✅ |
| **Response Time (p99)** | <50ms | 75.85ms (NestJS) | ⚠️ |
| **Throughput** | >1,000 RPS | 49 RPS/instance | ⚠️ |
| **Error Rate** | <0.1% | 0.19% | ⚠️ |
| **Cache Hit Rate** | >85% | ~80% (estimated) | ⚠️ |
| **Database Query Time** | <10ms | ~5ms (estimated) | ✅ |

### Scaling Plan

- **20 instances** × 50 RPS = **1,000 RPS** capacity
- **Auto-scale to 30 instances** during peak = **1,500 RPS** capacity
- **With read replicas**: 2-3x read capacity
- **With Redis Cluster**: Higher availability + performance

---

## Summary

### Top 5 Performance Tips

1. **✅ Connection Pooling**: Increase to 50 connections
2. **✅ Response Compression**: Enable gzip/brotli (60-80% size reduction)
3. **✅ Pre-warm Cache**: Load top 10K users on startup
4. **✅ Horizontal Scaling**: 20-30 instances with auto-scaling
5. **✅ Database Read Replicas**: Distribute read load

### Expected Improvements

- **Response Time**: 11.78ms → **8-10ms** (p95)
- **Throughput**: 49 RPS → **1,000-1,500 RPS** (with scaling)
- **Cache Hit Rate**: 80% → **85-90%** (with pre-warming)
- **Error Rate**: 0.19% → **<0.1%** (with optimizations)

---

**Last Updated:** November 2025  
**Target:** 3M users, Dec 8-31, 2025

