# Realistic Load Testing on EC2

This guide covers running realistic load tests on EC2 t3.medium with 10 million test users.

## Overview

### Why EC2 t3.medium?

- **Real-world scenario**: Single node represents typical production setup
- **Cost-effective**: ~$30/month per instance
- **Realistic constraints**: Limited resources (2 vCPU, 4GB RAM)
- **Performance baseline**: Establishes minimum performance expectations

### Why 10 Million Users?

- **Realistic scale**: Matches production data volume
- **Cache behavior**: Tests cache effectiveness with large dataset
- **Database performance**: Tests query performance with partitioned data
- **Memory pressure**: Tests system under realistic data size

## Prerequisites

### Infrastructure Setup

1. **EC2 Instance** (Single Node - Everything Here)
   - Type: t3.medium (2 vCPU, 4GB RAM)
   - OS: Amazon Linux 2023 or Ubuntu 22.04
   - Storage: 100GB+ (for Docker images, MySQL data, and Redis)
   - Security Group: Allow ports 3000, 3306, 6379 from your laptop IP

2. **Your Laptop** (Monitoring & Load Testing)
   - Docker installed (for Prometheus & Grafana)
   - K6 installed (for load testing)
   - Network access to EC2 instance

### Architecture

```
┌─────────────────────────────────┐
│  Your Laptop                    │
│  ┌─────────────┐  ┌──────────┐ │
│  │  Prometheus │  │  Grafana │ │
│  │  (port 9090)│  │ (port    │ │
│  │             │  │  3001)   │ │
│  └──────┬──────┘  └─────┬─────┘ │
│         │               │       │
│         └───────┬───────┘       │
│                 │               │
│         ┌───────▼───────┐       │
│         │  K6 Load Test │       │
│         └───────┬───────┘       │
└─────────────────┼───────────────┘
                   │
                   │ HTTP (3000)
                   │ Metrics (/metrics)
                   │
┌──────────────────▼──────────────────┐
│  EC2 t3.medium (Single Node)       │
│  ┌──────────────────────────────┐  │
│  │  Docker Compose              │  │
│  │  ┌────────┐  ┌──────┐       │  │
│  │  │  API   │  │MySQL │       │  │
│  │  │ :3000  │  │ :3306│       │  │
│  │  └───┬────┘  └───┬──┘       │  │
│  │      │          │           │  │
│  │      └────┬─────┘           │  │
│  │           │                 │  │
│  │      ┌────▼────┐            │  │
│  │      │  Redis  │            │  │
│  │      │  :6379  │            │  │
│  │      └─────────┘            │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Step 1: Setup EC2 Instance

### Launch Instance

```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxxx \
  --subnet-id subnet-xxxxxxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=forecap-load-test}]'
```

### Connect and Setup

```bash
ssh -i your-key.pem ec2-user@your-instance-ip

# Update system
sudo yum update -y  # Amazon Linux
# or
sudo apt update && sudo apt upgrade -y  # Ubuntu

# Install Docker
sudo yum install docker -y  # Amazon Linux
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js (for load testing)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install K6
sudo yum install -y https://dl.k6.io/rpm/repo.rpm  # Amazon Linux
sudo yum install k6 -y
# or for Ubuntu
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D9B
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## Step 2: Generate 10 Million Test Users

### Clone Repository

```bash
git clone your-repo-url
cd forecap-2025/backend
npm install
```

### Configure Environment

```bash
# Create .env file for Docker Compose
cat > .env << EOF
MYSQL_ROOT_PASSWORD=root_password_change_me
MYSQL_PASSWORD=forecap_password_change_me
REDIS_PASSWORD=
EOF

# Note: MYSQL_HOST and REDIS_HOST will be set to service names in docker-compose
# (mysql and redis) - no need to set them in .env
```

### Generate Test Data

```bash
# Generate 10 million users (this will take several hours)
npm run generate:test-data 10000000

# Or generate in smaller chunks for testing
npm run generate:test-data 1000000   # 1 million first
npm run generate:test-data 10000000  # Then full 10 million
```

**Expected Time:**
- **1M users**: ~45-60 minutes
- **10M users**: ~8-12 hours (depending on instance and network)

**Tips:**
- Run during off-peak hours
- Use `screen` or `tmux` to keep session alive
- Monitor progress: Check database periodically

### Verify Data Generation

```sql
-- Check total count
SELECT COUNT(*) FROM user_recap_data;

-- Check distribution
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

-- Check sample data
SELECT * FROM user_recap_data 
WHERE user_id IN (1, 1000, 10000, 100000, 1000000, 5000000, 10000000)
ORDER BY user_id;
```

## Step 3: Deploy Application (Docker Compose)

### Start All Services

```bash
cd backend

# Start MySQL, Redis, and API together
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f api
```

### Verify Deployment

```bash
# Wait for services to be healthy (30-60 seconds)
sleep 30

# Check health
curl http://localhost:3000/health

# Check metrics
curl http://localhost:3000/metrics | head -20

# Test API with random user
USER_ID=$(shuf -i 1-10000000 -n 1)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SIGN=$(echo -n "${TIMESTAMP}forecap2025${USER_ID}" | base64)

curl -H "timestamp: ${TIMESTAMP}" \
     -H "user_id: ${USER_ID}" \
     -H "sign: ${SIGN}" \
     http://localhost:3000/api/user-data
```

### Check Database

```bash
# Connect to MySQL
docker exec -it forecap-mysql mysql -u forecap_user -p forecap_db

# Or from host (if port 3306 is exposed)
mysql -h localhost -P 3306 -u forecap_user -p forecap_db
```

### Check Redis

```bash
# Connect to Redis
docker exec -it forecap-redis redis-cli

# Check info
docker exec -it forecap-redis redis-cli INFO
```

## Step 4: Setup Monitoring (On Your Laptop)

### Update Prometheus Config

```bash
cd monitoring

# Edit prometheus/prometheus.local.yml
# Replace YOUR_EC2_IP with your EC2 instance public IP
# Or use sed:
export EC2_IP=your-ec2-public-ip
sed -i.bak "s/YOUR_EC2_IP/${EC2_IP}/g" prometheus/prometheus.local.yml
```

### Start Monitoring Stack

```bash
# Start Prometheus and Grafana on your laptop
docker-compose -f docker-compose.local.yml up -d

# Check status
docker-compose -f docker-compose.local.yml ps
```

### Access Dashboards

- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

### Verify Prometheus Can Scrape EC2

```bash
# Check targets in Prometheus
open http://localhost:9090/targets

# Should show "forecap-api" target as UP
# If DOWN, check:
# 1. EC2 security group allows port 3000 from your IP
# 2. API is running: curl http://EC2_IP:3000/health
# 3. Metrics endpoint: curl http://EC2_IP:3000/metrics
```

### Security Group Configuration

Make sure your EC2 security group allows:
- **Port 3000** (API): From your laptop IP
- **Port 3306** (MySQL): Optional, only if you want direct access
- **Port 6379** (Redis): Optional, only if you want direct access

## Step 5: Run Load Tests (From Your Laptop)

### Setup

```bash
# On your laptop
cd backend/load-test

# Set EC2 IP address
export EC2_IP=your-ec2-public-ip
export BASE_URL=http://${EC2_IP}:3000
```

### Test Scenarios

#### Scenario 1: Baseline (Low Load)

```bash
# 10 concurrent users, 5 minutes
BASE_URL=${BASE_URL} k6 run --vus 10 --duration 5m k6-test.js
```

**Expected Results:**
- Response time: < 50ms (p95)
- Throughput: 100-200 RPS
- Error rate: < 0.1%

#### Scenario 2: Normal Load

```bash
# 50 concurrent users, 10 minutes
BASE_URL=${BASE_URL} k6 run --vus 50 --duration 10m k6-test.js
```

**Expected Results:**
- Response time: < 100ms (p95)
- Throughput: 500-1000 RPS
- Error rate: < 0.5%

#### Scenario 3: High Load

```bash
# 100 concurrent users, 15 minutes
BASE_URL=${BASE_URL} k6 run --vus 100 --duration 15m k6-test.js
```

**Expected Results:**
- Response time: < 200ms (p95)
- Throughput: 1000-1500 RPS
- Error rate: < 1%

#### Scenario 4: Stress Test

```bash
# Ramp up to 200 users
SCENARIO=stress BASE_URL=${BASE_URL} k6 run k6-test.js
```

**Expected Results:**
- Response time: < 500ms (p95)
- Throughput: 1500-2000 RPS
- Error rate: < 2%

#### Scenario 5: Realistic Test (Recommended)

```bash
# Realistic user distribution with 10M users
BASE_URL=${BASE_URL} MAX_USER_ID=10000000 k6 run k6-realistic-test.js
```

**Expected Results:**
- Response time: < 200ms (p95)
- Throughput: 1000-1500 RPS
- Error rate: < 1%
- Cache hit rate: > 80% (after warm-up)

### Running Tests with Monitoring

**Best Practice**: Run load tests while monitoring in Grafana:

1. **Open Grafana**: http://localhost:3001
2. **Navigate to Dashboard**: Forecap API - Load Test Monitoring
3. **Start Load Test** (in another terminal):
   ```bash
   BASE_URL=${BASE_URL} MAX_USER_ID=10000000 k6 run k6-realistic-test.js
   ```
4. **Watch Real-Time Metrics**: Dashboard updates every 5 seconds

## Step 6: Monitor Performance

### Key Metrics to Watch

#### Application Metrics (Grafana)

1. **Request Rate**: Should match K6 load
2. **Response Time**: p95 should stay < 200ms
3. **Error Rate**: Should stay < 1%
4. **Cache Hit Rate**: Should be > 80% after warm-up

#### System Metrics (On EC2)

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# CPU and Memory usage
top
htop  # if installed

# Docker stats (all containers)
docker stats

# Individual container stats
docker stats forecap-api
docker stats forecap-mysql
docker stats forecap-redis

# Database connections
docker exec -it forecap-mysql mysql -u forecap_user -p -e "SHOW PROCESSLIST;"

# Redis info
docker exec -it forecap-redis redis-cli INFO
```

#### Database Metrics (On EC2)

```bash
# Connect to MySQL
docker exec -it forecap-mysql mysql -u forecap_user -p forecap_db

# Then run SQL queries:
```

```sql
-- Active connections
SHOW STATUS LIKE 'Threads_connected';

-- Query cache hit rate
SHOW STATUS LIKE 'Qcache_hits';
SHOW STATUS LIKE 'Com_select';

-- Slow queries
SHOW STATUS LIKE 'Slow_queries';

-- Table size
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'forecap_db'
ORDER BY size_mb DESC;

-- Check data distribution
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

## Step 7: Analyze Results

### Performance Benchmarks for t3.medium

| Metric | Target | Acceptable | Needs Optimization |
|--------|--------|------------|-------------------|
| **p50 Response** | < 30ms | < 50ms | > 50ms |
| **p95 Response** | < 100ms | < 200ms | > 200ms |
| **p99 Response** | < 200ms | < 500ms | > 500ms |
| **Throughput** | > 1000 RPS | > 500 RPS | < 500 RPS |
| **Error Rate** | < 0.1% | < 1% | > 1% |
| **Cache Hit Rate** | > 90% | > 80% | < 80% |
| **CPU Usage** | < 60% | < 80% | > 80% |
| **Memory Usage** | < 70% | < 85% | > 85% |

### Decision Matrix

**If performance meets targets:**
- ✅ NestJS is sufficient for your needs
- ✅ Single t3.medium can handle expected load
- ✅ Ready for production deployment

**If performance is borderline:**
- ⚠️ Consider optimizations:
  - Increase connection pool
  - Tune cache TTL
  - Add read replicas
  - Optimize queries

**If performance is insufficient:**
- ❌ Consider alternatives:
  - Upgrade to t3.large (more CPU/RAM)
  - Switch to Go (better performance)
  - Switch to Rust (maximum performance)
  - Add more instances (horizontal scaling)

## Step 8: Optimization Tips

### If Response Time is High

1. **Increase Cache TTL**: From 1 hour to 2-4 hours
2. **Optimize Queries**: Ensure indexes are used
3. **Connection Pool**: Increase from 20 to 30-40
4. **Read Replicas**: Add MySQL read replica

### If Throughput is Low

1. **Horizontal Scaling**: Add more EC2 instances
2. **Load Balancer**: Distribute traffic
3. **Connection Pooling**: Increase pool size
4. **Batch Processing**: Optimize batch operations

### If Cache Hit Rate is Low

1. **Pre-warm Cache**: Load popular users into cache
2. **Increase TTL**: Longer cache duration
3. **Cache Strategy**: Consider write-through for updates
4. **Memory Size**: Increase Redis memory

### If CPU/Memory is High

1. **Upgrade Instance**: t3.medium → t3.large
2. **Optimize Code**: Profile and optimize hot paths
3. **Reduce Overhead**: Minimize logging in production
4. **Horizontal Scale**: Add more instances

## Step 9: Generate Load Test Report

### Create Report Script

```bash
#!/bin/bash
# generate-report.sh

echo "# Load Test Report - EC2 t3.medium" > report.md
echo "Date: $(date)" >> report.md
echo "" >> report.md

echo "## Test Configuration" >> report.md
echo "- Instance: t3.medium (2 vCPU, 4GB RAM)" >> report.md
echo "- Database: RDS MySQL (10M users)" >> report.md
echo "- Cache: ElastiCache Redis" >> report.md
echo "" >> report.md

echo "## Results" >> report.md
# Add K6 output
k6 run k6-test.js --out json=results.json
# Parse and add to report
```

### Export Grafana Dashboard

1. Open Grafana dashboard
2. Click **Share** → **Export**
3. Save as PDF or PNG
4. Include in report

## Troubleshooting

### High Response Times

**Check:**
- Database query performance
- Network latency to RDS/Redis
- Connection pool exhaustion
- CPU throttling

**Solutions:**
- Add database indexes
- Use read replicas
- Increase connection pool
- Upgrade instance type

### Low Throughput

**Check:**
- CPU usage (should be < 80%)
- Memory usage (should be < 85%)
- Database connection limits
- Network bandwidth

**Solutions:**
- Upgrade instance
- Add more instances
- Optimize queries
- Increase connection limits

### High Error Rate

**Check:**
- Application logs
- Database errors
- Connection timeouts
- Memory errors

**Solutions:**
- Check error logs
- Increase timeouts
- Add retry logic
- Scale resources

## Next Steps

After load testing:

1. **Document Findings**: Record all metrics and observations
2. **Compare with Targets**: Check if NestJS meets requirements
3. **Make Decision**: Stick with NestJS or switch to Go/Rust
4. **Optimize**: Apply optimizations if needed
5. **Plan Production**: Scale based on test results

---

## Quick Reference

### Commands (On EC2)

```bash
# Start all services
cd backend
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Stop all services
docker-compose -f docker-compose.production.yml down

# Generate test data (on EC2)
npm run generate:test-data 10000000

# Check services
docker ps
docker stats

# Check database
docker exec -it forecap-mysql mysql -u forecap_user -p -e "SELECT COUNT(*) FROM user_recap_data;"
```

### Commands (On Your Laptop)

```bash
# Start monitoring
cd monitoring
docker-compose -f docker-compose.local.yml up -d

# Run load test
cd backend/load-test
export EC2_IP=your-ec2-public-ip
export BASE_URL=http://${EC2_IP}:3000
BASE_URL=${BASE_URL} MAX_USER_ID=10000000 k6 run k6-realistic-test.js

# Access Grafana
open http://localhost:3001

# Access Prometheus
open http://localhost:9090
```

### Expected Performance (t3.medium)

- **Max RPS**: ~1,500-2,000 requests/second
- **Concurrent Users**: 100-150 users
- **Response Time**: < 200ms (p95) under normal load
- **Cache Hit Rate**: 80-90% after warm-up

---

**Note**: These are realistic expectations for a single t3.medium instance with everything running in Docker. For production with 1M users, consider:
- Multiple instances behind load balancer
- Separate RDS and ElastiCache (better performance)
- Larger cache instance
- Auto-scaling based on metrics

### Architecture Benefits

**Single Node Setup:**
- ✅ Cost-effective: Single EC2 instance
- ✅ Simple: Everything in Docker Compose
- ✅ Realistic: Tests actual resource constraints
- ✅ Isolated: No interference from other services

**Laptop Monitoring:**
- ✅ No EC2 resources used for monitoring
- ✅ Easy access to Grafana/Prometheus
- ✅ Can run multiple test scenarios
- ✅ Better visualization on local machine

