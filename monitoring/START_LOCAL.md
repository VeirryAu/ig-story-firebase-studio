# Start Monitoring on Local MacBook (Docker)

Quick guide to run Grafana and Prometheus on your MacBook to monitor your local Docker backend.

## Prerequisites

1. **Docker Desktop** is running
2. **Backend is running** in Docker (see `backend/SETUP_DOCKER.md`)

## Quick Start (3 Commands)

### Step 1: Start Backend (if not already running)

```bash
cd /Users/FH-TEC-VeirryA/Project/fore-web/forecap-2025/backend
docker compose up -d
```

Wait 30 seconds for MySQL to initialize, then verify:

```bash
curl http://localhost:3000/health
```

### Step 2: Start Monitoring

```bash
cd /Users/FH-TEC-VeirryA/Project/fore-web/forecap-2025/monitoring
docker compose -f docker-compose.local.yml up -d
```

### Step 3: Access Grafana

Open your browser:
- **Grafana**: http://localhost:3001
  - Username: `admin`
  - Password: `admin`

The dashboard is already configured and will appear automatically!

## Verify Everything Works

### Check Services Are Running

```bash
# Check backend
docker compose -f ../backend/docker-compose.yml ps

# Check monitoring
docker compose -f docker-compose.local.yml ps
```

### Check Prometheus Can Scrape Backend

1. Open: http://localhost:9090
2. Go to **Status** → **Targets**
3. Should show "forecap-api" as **UP** (green)

### Check Grafana Dashboard

1. Open: http://localhost:3001
2. Login: `admin` / `admin`
3. Navigate: **Dashboards** → **Forecap** → **Forecap API - Load Test Monitoring**
4. You should see 8 panels (may be empty until there's traffic)

### Generate Some Traffic

```bash
# Test API to generate metrics
curl http://localhost:3000/health

# Or test with authentication
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
USER_ID=1
SIGN=$(echo -n "${TIMESTAMP}forecap2025${USER_ID}" | base64)

curl -H "timestamp: ${TIMESTAMP}" \
     -H "user_id: ${USER_ID}" \
     -H "sign: ${SIGN}" \
     http://localhost:3000/api/user-data
```

Refresh Grafana dashboard - you should see metrics appear!

## Architecture

```
┌─────────────────────────────────────┐
│  Your MacBook                      │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Backend Docker Compose      │  │
│  │  - MySQL (port 3306)        │  │
│  │  - Redis (port 6379)        │  │
│  │  - API (port 3000)          │  │
│  └──────────────┬───────────────┘  │
│                 │                   │
│                 │ Metrics           │
│                 │ (port 3000)       │
│                 │                   │
│  ┌──────────────▼───────────────┐  │
│  │  Monitoring Docker Compose  │  │
│  │  - Prometheus (port 9090)   │  │
│  │  - Grafana (port 3001)      │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

Prometheus uses `host.docker.internal:3000` to reach the backend API.

## Common Commands

### Start Everything

```bash
# Terminal 1: Start backend
cd backend && docker compose up -d

# Terminal 2: Start monitoring
cd monitoring && docker compose -f docker-compose.local.yml up -d
```

### View Logs

```bash
# Backend logs
cd backend && docker compose logs -f api

# Monitoring logs
cd monitoring && docker compose -f docker-compose.local.yml logs -f grafana
```

### Stop Everything

```bash
# Stop monitoring
cd monitoring && docker compose -f docker-compose.local.yml down

# Stop backend
cd backend && docker compose down
```

### Restart After Changes

```bash
# Restart monitoring
cd monitoring && docker compose -f docker-compose.local.yml restart

# Restart backend
cd backend && docker compose restart api
```

## Troubleshooting

### Prometheus Shows "DOWN" for forecap-api

**Check 1: Backend is running**
```bash
curl http://localhost:3000/health
# Should return JSON with status: "ok"
```

**Check 2: Metrics endpoint works**
```bash
curl http://localhost:3000/metrics
# Should return Prometheus metrics
```

**Check 3: Prometheus can reach backend**
```bash
# Test from Prometheus container
docker exec -it prometheus-local wget -O- http://host.docker.internal:3000/metrics
```

**Solution**: If `host.docker.internal` doesn't work, try:
```yaml
# In prometheus.local.yml, change to:
- targets: ['172.17.0.1:3000']  # Docker bridge network IP
```

### Grafana Shows No Data

**Check 1: Data source is working**
1. Grafana → Configuration → Data Sources
2. Click "Prometheus"
3. Click "Test" button
4. Should show: "Data source is working"

**Check 2: Time range**
- Make sure time range includes current time
- Try "Last 15 minutes" or "Last 1 hour"

**Check 3: Query returns data**
1. Open dashboard
2. Click on a panel → Edit
3. Check if query shows data in Prometheus

### Dashboard Not Appearing

**Check 1: Dashboard file exists**
```bash
ls -la monitoring/grafana/dashboards/forecap-api-dashboard.json
```

**Check 2: Grafana logs**
```bash
docker compose -f docker-compose.local.yml logs grafana | grep -i dashboard
```

**Solution: Manual import**
1. Open Grafana
2. Go to Dashboards → Import
3. Upload `monitoring/grafana/dashboards/forecap-api-dashboard.json`

## Dashboard Panels

Once working, you'll see:

1. **Request Rate (RPS)** - Requests per second
2. **Response Time** - p50, p95, p99 percentiles
3. **Error Rate** - Failed requests
4. **Cache Hit Rate** - Redis effectiveness
5. **Database Connection Pool** - Active/idle connections
6. **Database Query Duration** - Query performance
7. **CPU Usage** - System CPU
8. **Memory Usage** - System memory

## Next Steps

1. ✅ **Monitoring is running** - Grafana at http://localhost:3001
2. **Run load tests** - See `backend/load-test/README.md`
3. **Watch real-time metrics** - Dashboard updates every 5 seconds
4. **Export reports** - Click Share → Export in Grafana

---

**Everything is ready!** Just start both Docker Compose stacks and open Grafana.

