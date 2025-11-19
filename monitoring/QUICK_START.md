# Grafana Monitoring - Quick Start

Yes! The monitoring is **ready** in Grafana. Here's how to use it:

## ✅ What's Already Configured

1. **Grafana Dashboard** - Pre-configured with 8 panels
2. **Prometheus Data Source** - Auto-configured
3. **Dashboard Auto-Loading** - Dashboard loads automatically
4. **Docker Compose** - Ready to start

## 🚀 Quick Start (3 Steps)

### Step 1: Update Prometheus Config

Edit `monitoring/prometheus/prometheus.local.yml`:

```bash
cd monitoring
nano prometheus/prometheus.local.yml
```

**Change this line:**
```yaml
- targets: ['YOUR_EC2_IP:3000']  # Replace YOUR_EC2_IP with actual IP
```

**To:**
```yaml
- targets: ['host.docker.internal:3000']  # For local Docker backend
# OR
- targets: ['localhost:3000']  # If backend runs directly (not Docker)
```

### Step 2: Start Monitoring Stack

```bash
cd monitoring
docker compose -f docker-compose.local.yml up -d
```

### Step 3: Access Grafana

1. **Open browser**: http://localhost:3001
2. **Login**:
   - Username: `admin`
   - Password: `admin`
3. **Navigate to Dashboard**:
   - Click **Dashboards** (left menu)
   - Click **Forecap** folder
   - Click **Forecap API - Load Test Monitoring**

## 📊 Dashboard Panels

The dashboard includes 8 pre-configured panels:

1. **Request Rate (RPS)** - Requests per second
2. **Response Time (p50, p95, p99)** - Response time percentiles
3. **Error Rate** - Failed requests over time
4. **Cache Hit Rate** - Redis cache effectiveness
5. **Database Connection Pool** - Active/idle connections
6. **Database Query Duration** - Query performance
7. **CPU Usage** - System CPU utilization
8. **Memory Usage** - System memory usage

## 🔧 Configuration Options

### Option A: Backend in Docker (Recommended)

If your backend runs in Docker (`docker compose up`):

```yaml
# prometheus.local.yml
- targets: ['host.docker.internal:3000']
```

### Option B: Backend Directly (npm run start:dev)

If your backend runs directly:

```yaml
# prometheus.local.yml
- targets: ['host.docker.internal:3000']
# OR
- targets: ['172.17.0.1:3000']  # Docker bridge network IP
```

### Option C: Backend on EC2

If your backend runs on EC2:

```yaml
# prometheus.local.yml
- targets: ['YOUR_EC2_PUBLIC_IP:3000']
```

## ✅ Verify Everything Works

### 1. Check Prometheus Can Scrape

```bash
# Open Prometheus
open http://localhost:9090

# Go to Status > Targets
# Should show "forecap-api" as UP (green)
```

### 2. Check Grafana Data Source

1. Open Grafana: http://localhost:3001
2. Go to **Configuration** > **Data Sources**
3. Click **Prometheus**
4. Click **Test** button
5. Should show: "Data source is working"

### 3. Check Dashboard Has Data

1. Open dashboard: **Forecap API - Load Test Monitoring**
2. Panels should show graphs (may be empty if no traffic yet)
3. Run a test request:
   ```bash
   curl http://localhost:3000/health
   ```
4. Refresh dashboard - should see metrics appear

## 🐛 Troubleshooting

### No Data in Dashboard

**Check 1: Prometheus can reach API**
```bash
# From Prometheus container
docker exec -it prometheus-local wget -O- http://host.docker.internal:3000/metrics
```

**Check 2: API metrics endpoint works**
```bash
curl http://localhost:3000/metrics
# Should return Prometheus metrics
```

**Check 3: Prometheus targets**
- Open: http://localhost:9090/targets
- Check if "forecap-api" is UP

### Dashboard Not Showing

**Check 1: Dashboard file exists**
```bash
ls -la monitoring/grafana/dashboards/forecap-api-dashboard.json
```

**Check 2: Grafana logs**
```bash
docker compose -f docker-compose.local.yml logs grafana
```

**Check 3: Manual import**
1. Open Grafana
2. Go to **Dashboards** > **Import**
3. Upload `monitoring/grafana/dashboards/forecap-api-dashboard.json`

### Prometheus Can't Scrape

**Solution 1: Check network**
```bash
# Test from Prometheus container
docker exec -it prometheus-local ping host.docker.internal
```

**Solution 2: Use Docker network IP**
```bash
# Find Docker network IP
docker network inspect monitoring_monitoring

# Use that IP in prometheus.local.yml
```

## 📝 Quick Commands

```bash
# Start monitoring
cd monitoring
docker compose -f docker-compose.local.yml up -d

# Stop monitoring
docker compose -f docker-compose.local.yml down

# View logs
docker compose -f docker-compose.local.yml logs -f grafana

# Restart after config changes
docker compose -f docker-compose.local.yml restart prometheus
```

## 🎯 Next Steps

1. ✅ **Start monitoring**: `docker compose -f docker-compose.local.yml up -d`
2. ✅ **Start backend**: `cd backend && docker compose up -d`
3. ✅ **Open Grafana**: http://localhost:3001
4. ✅ **Run load test**: See `backend/load-test/README.md`
5. ✅ **Watch metrics**: Dashboard updates every 5 seconds

---

**Everything is ready!** Just update the Prometheus target IP and start the stack.

