# Forecap Backend (Go)

This service mirrors the NestJS and Rust APIs so you can benchmark Go performance with the same contracts, authentication, caching, and monitoring.

## Features

- `GET /api/user-data`
  - Validates header-based auth (`timestamp`, `user_id`, `sign`)
  - Cache-aside Redis layer with configurable TTL
  - Single-table MySQL query that parses JSON columns in the app
- `GET /health` checks MySQL + Redis connectivity
- `GET /metrics` exposes Prometheus metrics with the `service="forecap-api-go"` label
- Structured metrics for HTTP latency, DB timings, cache hit ratio

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `4001` | HTTP port |
| `MYSQL_HOST` | `localhost` | MySQL host |
| `MYSQL_PORT` | `3306` | MySQL port |
| `MYSQL_USER` | `root` | MySQL user |
| `MYSQL_PASSWORD` | *(empty)* | MySQL password |
| `MYSQL_DATABASE` | `forecap_db` | Database name |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | *(empty)* | Redis password |
| `CACHE_TTL_SECONDS` | `3600` | Redis TTL |
| `AUTH_SIGNATURE_SECRET` | *(empty)* | Optional signature secret |
| `SERVICE_NAME` | `forecap-api-go` | Injected into Prometheus metrics |

## Local Run

```bash
cd backend-go
go mod tidy   # downloads dependencies / generates go.sum
go run .
```

Hit `http://localhost:4001/health` to verify connectivity, then call `/api/user-data` with the same headers used by the NestJS backend.

## Docker

```bash
docker build -t forecap-api-go backend-go
docker run --rm -p 4001:4001 \
  -e MYSQL_HOST=forecap-mysql \
  -e MYSQL_PASSWORD=rootpassword \
  -e REDIS_HOST=forecap-redis \
  forecap-api-go
```

## Integration Points

- Added `go-api` service to `backend/docker-compose.yml`
- Added Prometheus scrape job and Grafana panels (label `service="forecap-api-go"`)
- Load-testing docs updated so you can point k6/Artillery to Go by setting `BASE_URL=http://localhost:4001`


