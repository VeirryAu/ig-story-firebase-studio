# Grafana Monitoring - Quick Start

Yes! The monitoring is **ready** in Grafana. Here's how to use it:

## ✅ What's Already Configured

1. **Grafana Dashboard** - Pre-configured with 8 panels
2. **Prometheus Data Source** - Auto-configured
3. **Dashboard Auto-Loading** - Dashboard loads automatically
4. **Docker Compose** - Ready to start

## 🚀 Quick Start (3 Steps)

### Step 1: Create Shared Docker Network (one-time)

```bash
docker network create forecap-net || true
```

Both `backend/docker-compose.yml` and `monitoring/docker-compose.local.yml` attach to this external network so services can reach each other by name.

Prometheus already targets `forecap-api:3000`, so no further config change is required once the shared network exists.

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

The dashboard includes 10 pre-configured panels:

1. **Request Rate (RPS)** - Requests per second
2. **Response Time (p50, p95, p99)** - Response time percentiles
3. **Error Rate** - Failed requests over time
4. **Cache Hit Rate** - Redis cache effectiveness
5. **Database Connection Pool** - Active/idle connections
6. **Database Query Duration** - Query performance
7. **CPU Usage** - System CPU utilization
8. **Memory Usage** - System memory usage
9. **MySQL Connections** - Threads connected/running (mysqld-exporter)
10. **Redis Memory & Clients** - Memory footprint and connected clients (redis-exporter)

## 🔧 Configuration Options

### Backend Deployment Options

- **Docker (recommended)**: Prometheus targets `forecap-api:3000` via the shared `forecap-net` network (already configured).
- **Host mode (npm run start:dev)**: Change the target in `prometheus.local.yml` to `host.docker.internal:3000`.
- **Remote/EC2**: Change the target to your EC2 public IP (ensure security group allows port 3000 from your laptop).

> **Note:** `mysqld-exporter` reads credentials from `monitoring/mysql-exporter/.my.cnf`. Update that file (and restart the exporter) if you change MySQL usernames/passwords.

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

**Check 1: API metrics endpoint works**
```bash
curl http://localhost:3000/metrics
# Should return Prometheus metrics
```

**Check 2: Prometheus can reach API via Docker network**
```bash
# From Prometheus container
docker exec -it prometheus-local wget -O- http://forecap-api:3000/metrics
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
# Both stacks must be on the same network
docker network ls | grep forecap-net
```

**Solution 2: Ensure services joined the network**
```bash
docker inspect forecap-api | grep forecap-net -A3
docker inspect prometheus-local | grep forecap-net -A3
```

**Solution 3: Recreate network if needed**
```bash
docker network rm forecap-net
docker network create forecap-net
# Then restart both docker-compose stacks
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

