# Docker Setup Guide - NestJS Backend on MacBook

Complete step-by-step guide to run the entire backend stack (MySQL, Redis, NestJS API) using Docker on your MacBook.

## Prerequisites

### 1. Install Docker Desktop

Download and install Docker Desktop for Mac:
- **Download**: https://www.docker.com/products/docker-desktop/
- **System Requirements**: macOS 10.15 or newer

### 2. Verify Docker Installation

```bash
# Check Docker version
docker --version
# Should show: Docker version 24.x.x or higher

# Check Docker Compose version
docker compose version
# Should show: Docker Compose version v2.x.x or higher

# Verify Docker is running
docker ps
# Should show empty list (no errors)
```

If Docker is not running, open **Docker Desktop** application.

---

## Step 0: Create Shared Docker Network (one-time)

The backend stack exports an external Docker network named `forecap-net`. Create it once:

```bash
docker network create forecap-net || true
```

If the network already exists, the command is ignored. Monitoring services will also attach to this network so Prometheus can reach the API by container name.

---

## Step 1: Navigate to Backend Directory

```bash
cd /Users/FH-TEC-VeirryA/Project/fore-web/forecap-2025/backend
```

---

## Step 2: Review Docker Compose Configuration

The `docker-compose.yml` file includes:
- **MySQL 8.0** - Database server
- **Redis 7** - Cache server
- **NestJS API** - Backend application

All services are pre-configured and will start automatically.

---

## Step 3: Start All Services

### Start Everything

```bash
docker compose up -d
```

This command will:
1. Pull required Docker images (if not already downloaded)
2. Create Docker network for services to communicate
3. Start MySQL container
4. Start Redis container
5. Build and start NestJS API container
6. Run database schema initialization

**Expected output:**
```
[+] Running 4/4
 ✔ Network backend_default      Created
 ✔ Volume "backend_mysql_data"   Created
 ✔ Volume "backend_redis_data"   Created
 ✔ Container forecap-mysql       Started
 ✔ Container forecap-redis       Started
 ✔ Container forecap-api         Started
```

**First time setup**: May take 2-3 minutes to download images and build.

---

## Step 4: Check Service Status

```bash
# Check all containers are running
docker compose ps
```

**Expected output:**
```
NAME             IMAGE              STATUS          PORTS
forecap-api      backend-api        Up 30 seconds   0.0.0.0:3000->3000/tcp
forecap-mysql    mysql:8.0          Up 30 seconds   0.0.0.0:3306->3306/tcp
forecap-redis    redis:7-alpine     Up 30 seconds   0.0.0.0:6379->6379/tcp
```

All containers should show **STATUS: Up**.

---

## Step 5: Wait for Services to Be Ready

Wait 30-60 seconds for MySQL to initialize:

```bash
# Check MySQL logs to see when it's ready
docker compose logs mysql | grep "ready for connections"
```

You should see:
```
[Note] [Entrypoint] MySQL init process done. Ready for connections.
```

---

## Step 6: Verify Database Schema

The database schema is automatically created from `setup-mysql-schema-lean.sql`.

**Verify database was created:**

```bash
# Connect to MySQL container
docker exec -it forecap-mysql mysql -u root -prootpassword -e "SHOW DATABASES;"
```

Should show `forecap_db` in the list.

**Verify table exists:**

```bash
docker exec -it forecap-mysql mysql -u root -prootpassword -e "USE forecap_db; SHOW TABLES;"
```

Should show `user_recap_data` table.

---

## Step 7: Check API Logs

```bash
# View API logs
docker compose logs api

# Follow logs in real-time
docker compose logs -f api
```

**Expected output:**
```
forecap-api  | [Nest] 1  - 12/01/2024, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
forecap-api  | [Nest] 1  - 12/01/2024, 10:00:00 AM     LOG [InstanceLoader] AppModule dependencies initialized
forecap-api  | [Nest] 1  - 12/01/2024, 10:00:00 AM     LOG [NestApplication] Nest application successfully started
```

---

## Step 8: Test the API

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

### Test Metrics Endpoint

```bash
curl http://localhost:3000/metrics
```

Should return Prometheus metrics.

### Test API Endpoint

```bash
# Generate auth headers
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
USER_ID=1
SIGNATURE_SECRET=${AUTH_SIGNATURE_SECRET:-""}  # leave empty if no secret
SIGN=$(printf "%s" "${TIMESTAMP}${SIGNATURE_SECRET}${USER_ID}" | base64)

# Test API
curl -H "timestamp: ${TIMESTAMP}" \
     -H "user_id: ${USER_ID}" \
     -H "sign: ${SIGN}" \
     http://localhost:3000/api/user-data
```

**Note**: Will return `null` if user_id=1 doesn't exist in database.

---

## Step 9: Access Swagger Documentation

Open your browser:

```
http://localhost:3000/api
```

You should see the Swagger UI with API documentation.

---

## Step 10: (Optional) Import Test Data

### Option A: Import from Excel

```bash
# Copy Excel file to backend directory (if needed)
# Then import
docker exec -it forecap-api npm run import:excel /path/to/file.xlsx
```

### Option B: Generate Test Data

```bash
# Generate 1000 test users
docker exec -it forecap-api npm run generate:test-data 1000

# Generate 10 million users (for load testing)
docker exec -it forecap-api npm run generate:test-data 10000000
```

**Note**: For large datasets, you may want to run this in the background:

```bash
docker exec -d forecap-api npm run generate:test-data 10000000
```

---

## Common Docker Commands

### View Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs api
docker compose logs mysql
docker compose logs redis

# Follow logs (real-time)
docker compose logs -f api
```

### Stop Services

```bash
# Stop all services (containers remain)
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (⚠️ deletes data)
docker compose down -v
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart api
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker compose up -d --build

# Rebuild specific service
docker compose up -d --build api
```

### Access Container Shell

```bash
# Access API container
docker exec -it forecap-api sh

# Access MySQL container
docker exec -it forecap-mysql bash

# Access Redis container
docker exec -it forecap-redis sh
```

### Check Resource Usage

```bash
# View container stats
docker stats

# View specific container
docker stats forecap-api
```

---

## Troubleshooting

### Issue: Port Already in Use

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
# Edit: ports: - "3001:3000"
```

### Issue: MySQL Won't Start

**Error**: `MySQL container keeps restarting`

**Solution**:

```bash
# Check MySQL logs
docker compose logs mysql

# Common issues:
# 1. Port 3306 already in use
# 2. Volume permissions issue
# 3. Insufficient memory

# Check if MySQL is already running locally
brew services list | grep mysql
# If running, stop it: brew services stop mysql@8.0
```

### Issue: API Can't Connect to MySQL/Redis

**Error**: `ECONNREFUSED` or connection timeout

**Solution**:

```bash
# Check if services are running
docker compose ps

# Check network connectivity
docker exec -it forecap-api ping mysql
docker exec -it forecap-api ping redis

# Check service logs
docker compose logs api
```

### Issue: Database Schema Not Created

**Error**: `Table 'forecap_db.user_recap_data' doesn't exist`

**Solution**:

```bash
# Check if schema file is mounted correctly
docker exec -it forecap-mysql ls -la /docker-entrypoint-initdb.d/

# Manually run schema
docker exec -i forecap-mysql mysql -u root -prootpassword < ../scripts/setup-mysql-schema-lean.sql
```

### Issue: Out of Memory

**Error**: Container keeps restarting or OOM errors

**Solution**:

1. **Increase Docker Desktop memory:**
   - Open Docker Desktop
   - Go to Settings → Resources → Advanced
   - Increase Memory to at least 4GB
   - Click "Apply & Restart"

2. **Reduce container memory limits** in `docker-compose.yml`

### Issue: Slow Performance

**Solutions**:

1. **Allocate more resources to Docker Desktop**
2. **Use Docker volumes for better I/O performance**
3. **Check if other applications are using resources**

---

## Data Persistence

### Volumes

Docker Compose creates volumes to persist data:

- `mysql_data` - MySQL database files
- `redis_data` - Redis data files

**View volumes:**
```bash
docker volume ls
```

**Backup MySQL data:**
```bash
# Create backup
docker exec forecap-mysql mysqldump -u root -prootpassword forecap_db > backup.sql

# Restore backup
docker exec -i forecap-mysql mysql -u root -prootpassword forecap_db < backup.sql
```

**⚠️ Warning**: Running `docker compose down -v` will **delete all data** in volumes.

---

## Development Workflow

### Making Code Changes

1. **Edit code** in your IDE
2. **Rebuild container:**
   ```bash
   docker compose up -d --build api
   ```
3. **Check logs** to verify changes:
   ```bash
   docker compose logs -f api
   ```

### Hot Reload (Development)

For development with hot reload, you can mount your code:

```yaml
# Add to docker-compose.yml api service:
volumes:
  - .:/app
  - /app/node_modules
```

Then restart:
```bash
docker compose up -d
```

---

## Production Build

To build for production:

```bash
# Build production image
docker build -t forecap-api:latest .

# Run production container
docker run -d \
  --name forecap-api-prod \
  -p 3000:3000 \
  -e MYSQL_HOST=mysql \
  -e REDIS_HOST=redis \
  forecap-api:latest
```

---

## Clean Up

### Remove Everything

```bash
# Stop and remove containers
docker compose down

# Remove containers, volumes, and networks
docker compose down -v

# Remove images (optional)
docker rmi backend-api mysql:8.0 redis:7-alpine
```

---

## Quick Reference

```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# View logs
docker compose logs -f api

# Restart service
docker compose restart api

# Rebuild after code changes
docker compose up -d --build api

# Access container
docker exec -it forecap-api sh

# Check status
docker compose ps

# Test API
curl http://localhost:3000/health
```

---

## Next Steps

1. ✅ **Backend is running** at `http://localhost:3000`
2. **Import test data** (optional)
3. **Connect frontend** to backend
4. **Set up monitoring** (optional) - see `monitoring/README.md`

---

**Need Help?** Check the main [README.md](./README.md) or [Deployment Guide](../docs/deployment-guide.md)

