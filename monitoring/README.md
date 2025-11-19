# Monitoring Setup Guide

Real-time monitoring during load testing using Prometheus and Grafana.

## Quick Start

### 0. Create Shared Docker Network (once)

```bash
docker network create forecap-net || true
```

Both backend and monitoring stacks attach to this external network so exporters can reach the API, MySQL, and Redis containers by name.

### 1. Start Monitoring Stack

```bash
cd monitoring
docker-compose up -d
```

This starts:
- **Prometheus** (port 9090) - Metrics collection
- **Grafana** (port 3001) - Visualization dashboard
- **MySQL Exporter** (port 9104) - Database metrics
- **Redis Exporter** (port 9121) - Cache metrics

### 2. Access Dashboards

- **Grafana**: http://localhost:3001
  - Username: `admin`
  - Password: `admin`
- **Prometheus**: http://localhost:9090

### 3. Start Your API

Make sure your NestJS API is running and exposing metrics:

```bash
cd backend
npm run start:dev
```

Metrics endpoint: http://localhost:3000/metrics

### 4. Run Load Test

```bash
cd backend/load-test

# Basic load test
k6 run k6-test.js

# With Prometheus integration (if using k6 cloud)
k6 cloud k6-prometheus.js
```

### 5. View Real-Time Metrics

1. Open Grafana: http://localhost:3001
2. Login with admin/admin
3. Navigate to **Dashboards** > **Forecap** > **Forecap API - Load Test Monitoring**
4. Watch metrics update in real-time!

## Dashboard Panels

The dashboard includes:

1. **Request Rate (RPS)** - Requests per second
2. **Response Time** - p50, p95, p99 percentiles
3. **Error Rate** - Failed requests over time
4. **Cache Hit Rate** - Redis cache effectiveness
5. **Database Connection Pool** - Active/idle connections
6. **Database Query Duration** - Query performance
7. **CPU Usage** - System CPU utilization
8. **Memory Usage** - System memory usage
9. **MySQL Connections** - Threads connected/running (mysqld-exporter)
10. **Redis Memory & Clients** - Memory footprint and connected clients (redis-exporter)

### MySQL & Redis Exporters

- **mysqld-exporter** (prom/mysqld-exporter) scrapes `forecap-mysql:3306` via the shared `forecap-net` network. It reads credentials from `monitoring/mysql-exporter/.my.cnf`. Update that file (and restart the container) if you change MySQL users/passwords; use a read-only user in production.
- **redis-exporter** (oliver006/redis_exporter) scrapes `forecap-redis:6379` for cache metrics.

Both exporters are part of `monitoring/docker-compose.local.yml` and are scraped automatically by Prometheus.

## Configuration

### Update Prometheus Targets

Edit `monitoring/prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'forecap-api'
    static_configs:
      - targets: ['forecap-api:3000']  # Backend container name on shared network
```

For production, use actual IP or service name:
```yaml
- targets: ['api:3000']  # If API is in same Docker network
```

### Customize Grafana Dashboard

1. Open Grafana
2. Go to **Dashboards** > **Forecap API - Load Test Monitoring**
3. Click **Edit** (pencil icon)
4. Modify panels as needed
5. Click **Save**

## Metrics Available

### Application Metrics (from NestJS)

- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration histogram
- `http_request_errors_total` - Error count
- `db_query_duration_seconds` - Database query time
- `db_connection_pool_size` - Connection pool size
- `db_connection_pool_active` - Active connections
- `db_connection_pool_idle` - Idle connections
- `cache_hits_total` - Cache hits
- `cache_misses_total` - Cache misses
- `cache_operation_duration_seconds` - Cache operation time
- `api_response_time_seconds` - API response time

### System Metrics (from Node Exporter)

- `node_cpu_seconds_total` - CPU usage
- `node_memory_MemTotal_bytes` - Total memory
- `node_memory_MemAvailable_bytes` - Available memory
- `node_disk_io_time_seconds_total` - Disk I/O
- `node_network_receive_bytes_total` - Network receive
- `node_network_transmit_bytes_total` - Network transmit

### Database Metrics (from MySQL Exporter)

- `mysql_global_status_connections` - Total connections
- `mysql_global_status_threads_connected` - Active threads
- `mysql_global_status_queries` - Query count
- `mysql_global_status_slow_queries` - Slow queries

### Cache Metrics (from Redis Exporter)

- `redis_connected_clients` - Connected clients
- `redis_commands_processed_total` - Commands processed
- `redis_keyspace_hits_total` - Cache hits
- `redis_keyspace_misses_total` - Cache misses
- `redis_memory_used_bytes` - Memory usage

## Prometheus Queries

### Useful Queries

```promql
# Request rate
rate(http_requests_total[1m])

# Error rate percentage
rate(http_request_errors_total[1m]) / rate(http_requests_total[1m]) * 100

# p95 response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[1m]))

# Cache hit rate
rate(cache_hits_total[1m]) / (rate(cache_hits_total[1m]) + rate(cache_misses_total[1m]))

# Database connection pool utilization
db_connection_pool_active / db_connection_pool_size * 100

# CPU usage percentage
100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)
```

## Troubleshooting

### Prometheus Can't Scrape Metrics

1. Check API is running: `curl http://localhost:3000/metrics`
2. Verify Prometheus config: Check `prometheus.yml` targets
3. Check network: Ensure containers can reach each other
4. Ensure both stacks share the same Docker network (`forecap-net`)

### Grafana Shows No Data

1. Check Prometheus is running: http://localhost:9090
2. Verify data source: Grafana > Configuration > Data Sources
3. Check time range: Make sure it's not set to "Last 5 minutes" when test just started
4. Check query: Verify PromQL query is correct

### Metrics Not Updating

1. Check scrape interval: Should be 5-15 seconds
2. Verify metrics endpoint: `curl http://localhost:3000/metrics`
3. Check Prometheus targets: http://localhost:9090/targets
4. Restart services: `docker-compose restart`

## Advanced: K6 Cloud Integration

For better K6 metrics visualization:

1. Sign up at https://k6.io/cloud
2. Get your API token
3. Run: `k6 cloud k6-prometheus.js`
4. View metrics in K6 Cloud dashboard

## Production Setup

For production monitoring:

1. **Use persistent volumes**: Already configured in docker-compose.yml
2. **Set up alerts**: Configure alertmanager in Prometheus
3. **Secure Grafana**: Change default password, enable HTTPS
4. **Use service discovery**: For dynamic targets in Kubernetes/ECS
5. **Long-term storage**: Configure remote storage for Prometheus

## Next Steps

- [Load Testing Guide](../backend/load-test/README.md)
- [Deployment Guide](../docs/deployment-guide.md)
- [Performance Tuning](../docs/performance-tuning.md)

