# Generate 10 Million Test Users - Docker Guide

Step-by-step guide to generate 10 million test users in your Docker setup.

## Prerequisites

1. **Backend is running** in Docker
2. **MySQL is ready** and schema is created
3. **Sufficient disk space** (~5-10GB for 10M users)

## Quick Start

### Option A: Run Inside Docker Container (Recommended)

```bash
# Navigate to backend directory
cd /Users/FH-TEC-VeirryA/Project/fore-web/forecap-2025/backend

# Generate 10 million users
docker exec -it forecap-api npm run generate:test-data 10000000
```

### Option B: Run from Host Machine

If you have Node.js installed locally:

```bash
cd /Users/FH-TEC-VeirryA/Project/fore-web/forecap-2025/backend

# Install dependencies (if not already done)
npm install

# Set environment variables to point to Docker MySQL/Redis
export MYSQL_HOST=localhost
export MYSQL_DATABASE=forecap_db
export MYSQL_USER=root
export MYSQL_PASSWORD=rootpassword
export REDIS_HOST=localhost
export REDIS_PORT=6379

# Generate 10 million users
npm run generate:test-data 10000000
```

## Expected Time

- **1M users**: ~45-60 minutes
- **10M users**: ~8-12 hours (depending on your MacBook performance)

## Monitor Progress

### View Real-Time Progress

The script shows progress in real-time:

```
Batch 1/2000 (1-5000)... ✓ 0.01% | Rate: 350/s | ETA: 7.9hours
Batch 2/2000 (5001-10000)... ✓ 0.02% | Rate: 352/s | ETA: 7.8hours
...
```

### Check Database Progress

Open a new terminal and check:

```bash
# Connect to MySQL
docker exec -it forecap-mysql mysql -u root -prootpassword forecap_db

# Check current count
SELECT COUNT(*) FROM user_recap_data;

# Check distribution
SELECT 
  CASE 
    WHEN trx_count = 0 THEN '0'
    WHEN trx_count BETWEEN 1 AND 10 THEN '1-10'
    WHEN trx_count BETWEEN 11 AND 50 THEN '11-50'
    WHEN trx_count BETWEEN 51 AND 200 THEN '51-200'
    ELSE '201+'
  END as trx_range,
  COUNT(*) as user_count
FROM user_recap_data
GROUP BY trx_range
ORDER BY trx_range;
```

### Monitor Container Resources

```bash
# Check container stats
docker stats forecap-api forecap-mysql

# Check disk usage
docker system df
```

## Run in Background (Recommended for 10M)

Since generating 10M users takes 8-12 hours, run it in the background:

### Option 1: Using Docker Exec (Detached)

```bash
# Run in background and save output to log
docker exec -d forecap-api sh -c "npm run generate:test-data 10000000 > /tmp/generate.log 2>&1"

# View progress
docker exec forecap-api tail -f /tmp/generate.log
```

### Option 2: Using Screen/Tmux

```bash
# Start a screen session
screen -S generate-data

# Run the command
docker exec -it forecap-api npm run generate:test-data 10000000

# Detach: Press Ctrl+A, then D
# Reattach: screen -r generate-data
```

### Option 3: Using nohup (if running from host)

```bash
nohup npm run generate:test-data 10000000 > generate.log 2>&1 &

# View progress
tail -f generate.log
```

## Verify After Completion

### Check Total Count

```bash
docker exec -it forecap-mysql mysql -u root -prootpassword -e "SELECT COUNT(*) as total_users FROM forecap_db.user_recap_data;"
```

Should show: `10000000`

### Check Sample Data

```bash
docker exec -it forecap-mysql mysql -u root -prootpassword forecap_db -e "SELECT * FROM user_recap_data LIMIT 5;"
```

### Check Distribution

```bash
docker exec -it forecap-mysql mysql -u root -prootpassword forecap_db -e "
SELECT 
  CASE 
    WHEN trx_count = 0 THEN '0'
    WHEN trx_count BETWEEN 1 AND 10 THEN '1-10'
    WHEN trx_count BETWEEN 11 AND 50 THEN '11-50'
    WHEN trx_count BETWEEN 51 AND 200 THEN '51-200'
    ELSE '201+'
  END as trx_range,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM user_recap_data), 2) as percentage
FROM user_recap_data
GROUP BY trx_range
ORDER BY trx_range;"
```

**Expected distribution:**
- 0 transactions: ~50%
- 1-10 transactions: ~30%
- 11-50 transactions: ~15%
- 51-200 transactions: ~4%
- 201+ transactions: ~1%

## Troubleshooting

### Out of Memory

**Error**: Container killed or OOM errors

**Solution**:
1. **Increase Docker Desktop memory:**
   - Docker Desktop → Settings → Resources → Advanced
   - Increase Memory to 8GB+ (for 10M users)
   - Click "Apply & Restart"

2. **Reduce batch size** (edit script):
   ```typescript
   const BATCH_SIZE = 2000; // Reduce from 5000
   ```

### Slow Performance

**Solutions**:

1. **Check MySQL configuration:**
   ```bash
   # Increase MySQL buffer pool (in docker-compose.yml)
   command: >
     --innodb-buffer-pool-size=2G
   ```

2. **Disable Redis during import** (if not needed):
   - The script doesn't use Redis, but you can stop it:
   ```bash
   docker compose stop redis
   ```

3. **Check disk I/O:**
   ```bash
   # Use SSD if possible
   # Check disk space
   df -h
   ```

### Connection Errors

**Error**: `ECONNREFUSED` or connection timeout

**Solutions**:

1. **Check MySQL is running:**
   ```bash
   docker compose ps mysql
   ```

2. **Check connection from container:**
   ```bash
   docker exec -it forecap-api ping mysql
   ```

3. **Increase connection limit:**
   ```yaml
   # In docker-compose.yml
   environment:
     - MYSQL_CONNECTION_LIMIT=50
   ```

### Process Killed

**Error**: Process stops unexpectedly

**Solutions**:

1. **Check container logs:**
   ```bash
   docker compose logs api | tail -50
   ```

2. **Check if container restarted:**
   ```bash
   docker compose ps api
   ```

3. **Run in smaller chunks:**
   ```bash
   # Generate 1M at a time
   docker exec -it forecap-api npm run generate:test-data 1000000
   # Wait for completion, then:
   docker exec -it forecap-api npm run generate:test-data 2000000
   # Continue until 10M
   ```

## Resume After Interruption

If the process stops, you can resume:

```bash
# Check current count
docker exec -it forecap-mysql mysql -u root -prootpassword -e "SELECT MAX(user_id) FROM forecap_db.user_recap_data;"

# Generate remaining users
# Example: if you have 5M, generate 5M more starting from 5000001
# (You'll need to modify the script to accept start_id parameter)
```

**Note**: The current script always starts from user_id=1. To resume, you'd need to modify the script or generate the remaining users separately.

## Performance Tips

1. **Close other applications** - Free up resources
2. **Use SSD** - Much faster than HDD
3. **Increase Docker resources** - More CPU/RAM = faster
4. **Monitor progress** - Check logs regularly
5. **Run overnight** - 10M users takes 8-12 hours

## Quick Commands Summary

```bash
# Generate 10M users (foreground)
docker exec -it forecap-api npm run generate:test-data 10000000

# Generate 10M users (background)
docker exec -d forecap-api sh -c "npm run generate:test-data 10000000 > /tmp/generate.log 2>&1"

# View progress
docker exec forecap-api tail -f /tmp/generate.log

# Check count
docker exec -it forecap-mysql mysql -u root -prootpassword -e "SELECT COUNT(*) FROM forecap_db.user_recap_data;"

# Check distribution
docker exec -it forecap-mysql mysql -u root -prootpassword forecap_db -e "SELECT trx_count, COUNT(*) FROM user_recap_data GROUP BY trx_count ORDER BY trx_count LIMIT 20;"
```

## Next Steps

After generating 10M users:

1. ✅ **Verify data** - Check counts and distribution
2. **Run load tests** - See `backend/load-test/README.md`
3. **Monitor performance** - Use Grafana dashboard
4. **Test API** - Query random users

---

**Note**: Generating 10M users is a long-running process. Make sure your MacBook is plugged in and won't sleep!

