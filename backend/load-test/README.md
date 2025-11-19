# Load Testing Guide

This guide explains how to perform load testing on the Forecap API to evaluate performance and determine if NestJS meets your requirements or if you should consider Go/Rust alternatives.

## Table of Contents

1. [Overview](#overview)
2. [Tools](#tools)
3. [K6 Testing](#k6-testing)
4. [Artillery Testing](#artillery-testing)
5. [Performance Benchmarks](#performance-benchmarks)
6. [Comparison with Go/Rust](#comparison-with-gorust)

---

## Overview

Load testing helps you:
- **Measure performance**: Response times, throughput, error rates
- **Find bottlenecks**: Database, cache, application layer
- **Determine capacity**: Max concurrent users, requests per second
- **Compare technologies**: NestJS vs Go vs Rust

### Key Metrics

- **Response Time**: p50, p95, p99 percentiles
- **Throughput**: Requests per second (RPS)
- **Error Rate**: Percentage of failed requests
- **Concurrent Users**: Maximum virtual users (VUs)
- **Resource Usage**: CPU, memory, database connections

---

## Tools

### K6 (Recommended)

**Pros:**
- JavaScript-based (easy to customize)
- Excellent metrics and reporting
- Supports multiple scenarios
- Free and open-source

**Install:**
```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D9B
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

### Artillery

**Pros:**
- YAML-based configuration
- Easy to set up
- Good for simple scenarios

**Install:**
```bash
npm install -g artillery
```

---

## K6 Testing

### Basic Test

```bash
cd backend/load-test
k6 run k6-test.js
```

### Different Scenarios

```bash
# Smoke test (1 user, 1 minute)
SCENARIO=smoke k6 run k6-test.js

# Load test (ramp up to 100 users)
SCENARIO=load k6 run k6-test.js

# Stress test (ramp up to 300 users)
SCENARIO=stress k6 run k6-test.js

# Spike test (sudden spike to 500 users)
SCENARIO=spike k6 run k6-test.js
```

### Custom Configuration

```bash
# Test against production
BASE_URL=https://api.example.com k6 run k6-test.js

# Custom scenario
SCENARIO=load BASE_URL=http://localhost:3000 k6 run k6-test.js
```

### Output

K6 generates:
- **Console output**: Real-time metrics
- **summary.json**: Detailed JSON report
- **summary.html**: HTML report (if configured)

### Example Output

```
✓ status is 200
✓ response time < 200ms
✓ has user data

checks.........................: 100.00% ✓ 5000    ✗ 0
data_received..................: 2.5 MB  417 kB/s
data_sent......................: 500 kB  83 kB/s
http_req_duration..............: avg=45ms   min=12ms   med=38ms   max=250ms   p(95)=120ms   p(99)=180ms
http_req_failed................: 0.00%   ✓ 0        ✗ 5000
http_reqs......................: 5000    833.33/s
iteration_duration..............: avg=145ms  min=112ms  med=138ms  max=350ms
vus............................: 100     min=100    max=100
```

---

## Artillery Testing

### Basic Test

```bash
cd backend/load-test
artillery run artillery-test.yml
```

### Custom Target

```bash
artillery run --target http://localhost:3000 artillery-test.yml
```

### Generate Report

```bash
artillery run --output report.json artillery-test.yml
artillery report report.json
```

---

## Performance Benchmarks

### Expected Performance (NestJS)

Based on typical NestJS performance:

| Metric | Target | Good | Excellent |
|--------|--------|------|-----------|
| **p50 Response Time** | < 50ms | < 30ms | < 20ms |
| **p95 Response Time** | < 200ms | < 100ms | < 50ms |
| **p99 Response Time** | < 500ms | < 200ms | < 100ms |
| **Throughput (RPS)** | > 500 | > 1000 | > 2000 |
| **Error Rate** | < 1% | < 0.1% | < 0.01% |
| **Concurrent Users** | > 100 | > 500 | > 1000 |

### Test Scenarios

#### 1. Baseline Test (No Load)

```bash
SCENARIO=smoke k6 run k6-test.js
```

**Expected:**
- Response time: < 50ms
- Error rate: 0%

#### 2. Normal Load (50-100 users)

```bash
SCENARIO=load k6 run k6-test.js
```

**Expected:**
- Response time: < 100ms (p95)
- Throughput: > 500 RPS
- Error rate: < 1%

#### 3. Stress Test (200-300 users)

```bash
SCENARIO=stress k6 run k6-test.js
```

**Expected:**
- Response time: < 200ms (p95)
- Throughput: > 1000 RPS
- Error rate: < 1%

#### 4. Spike Test (500+ users)

```bash
SCENARIO=spike k6 run k6-test.js
```

**Expected:**
- Response time: < 500ms (p95)
- System should recover after spike
- Error rate: < 5% during spike

---

## Comparison with Go/Rust

### When to Consider Alternatives

Consider Go or Rust if NestJS shows:

1. **High Response Times**: p95 > 500ms under load
2. **Low Throughput**: < 500 RPS with 100 concurrent users
3. **High Memory Usage**: > 2GB per instance
4. **High CPU Usage**: > 80% CPU under normal load
5. **Poor Resource Efficiency**: Need many instances for target load

### Expected Performance Comparison

| Technology | p95 Response | RPS (100 users) | Memory/Instance | CPU Efficiency |
|------------|-------------|-----------------|------------------|---------------|
| **NestJS** | 50-200ms | 500-2000 | 200-500MB | Good |
| **Go (Gin)** | 20-100ms | 2000-5000 | 50-100MB | Excellent |
| **Rust (Actix)** | 10-50ms | 5000-10000 | 30-80MB | Excellent |

### Go Implementation Example

If you need to switch to Go, here's a basic structure:

```go
// main.go
package main

import (
    "github.com/gin-gonic/gin"
    "database/sql"
    _ "github.com/go-sql-driver/mysql"
    "github.com/go-redis/redis/v8"
)

func main() {
    r := gin.Default()
    r.GET("/api/user-data", getUserData)
    r.Run(":3000")
}

func getUserData(c *gin.Context) {
    // Single query with JSON parsing
    // Similar to NestJS implementation
}
```

### Rust Implementation Example

```rust
// main.rs
use actix_web::{web, App, HttpServer, Result};
use mysql::*;
use redis::Commands;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/api/user-data", web::get().to(get_user_data))
    })
    .bind("127.0.0.1:3000")?
    .run()
    .await
}
```

### Migration Decision Matrix

| Factor | NestJS | Go | Rust |
|--------|--------|-----|------|
| **Development Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Performance** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Memory Usage** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Ecosystem** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Learning Curve** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

**Recommendation:**
- **Stick with NestJS** if: p95 < 200ms, RPS > 1000, team familiar with TypeScript
- **Switch to Go** if: Need better performance, lower memory, team knows Go
- **Switch to Rust** if: Need maximum performance, willing to invest in learning curve

---

## Continuous Load Testing

### CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/load-test.yml
name: Load Test
on: [push]
jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run K6 tests
        uses: grafana/k6-action@v0.2.0
        with:
          filename: backend/load-test/k6-test.js
          cloud: true
          token: ${{ secrets.K6_CLOUD_TOKEN }}
```

### Monitoring During Tests

```bash
# Monitor application
docker stats forecap-api

# Monitor database
mysql -u root -p -e "SHOW PROCESSLIST;"

# Monitor Redis
redis-cli --stat
```

---

## Troubleshooting

### High Response Times

1. **Check database**: Slow queries, connection pool exhaustion
2. **Check Redis**: Cache hit rate, network latency
3. **Check application**: CPU usage, memory leaks
4. **Check network**: Latency between services

### High Error Rate

1. **Check logs**: Application errors, database errors
2. **Check resources**: CPU, memory, database connections
3. **Check limits**: Rate limiting, connection limits

### Low Throughput

1. **Optimize queries**: Add indexes, optimize JSON parsing
2. **Increase resources**: More CPU, memory, database connections
3. **Horizontal scaling**: Add more instances

---

## Next Steps

1. Run baseline tests to establish current performance
2. Compare results with expected benchmarks
3. If performance is insufficient, consider:
   - Optimizing NestJS (connection pooling, caching)
   - Switching to Go (good balance)
   - Switching to Rust (maximum performance)
4. Document findings and decision

---

## References

- [K6 Documentation](https://k6.io/docs/)
- [Artillery Documentation](https://www.artillery.io/docs)
- [NestJS Performance](https://docs.nestjs.com/performance)
- [Go vs Node.js Benchmarks](https://benchmarksgame-team.pages.debian.net/benchmarksgame/index.html)

