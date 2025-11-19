# Forecap Backend (Rust)

Rust implementation of the Forecap API, built with Actix-web + SQLx + Redis. Provides the same `/api/user-data`, `/health`, and `/metrics` endpoints as the NestJS backend, so you can compare performance.

## Features

- Actix-web server with Tokio runtime
- MySQL connection pooling via SQLx
- Redis cache (cache-aside) with connection manager
- Signature validation compatible with the existing frontend/backend
- Date-restriction aware via the shared frontend config
- Prometheus metrics (`/metrics`) for easy comparison with Grafana dashboards

## Prerequisites

- Rust 1.75+ (install via `rustup`)
- MySQL 8.0 and Redis (reuse the ones from `backend/docker-compose` or any running instances)
- `forecap-net` Docker network if you plan to run inside Docker alongside the existing stack

## Environment Variables

```
MYSQL_HOST=forecap-mysql
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=rootpassword
MYSQL_DATABASE=forecap_db

REDIS_URL=redis://forecap-redis:6379

PORT=4000
CACHE_TTL_SECONDS=3600
AUTH_SIGNATURE_SECRET=   # optional; leave empty for base64(timestamp + user_id)
```

## Run Locally

```bash
cd backend-rust
cargo run
```

The API listens on `http://localhost:4000` by default.

## Docker

A multi-stage Dockerfile is provided. Build and run:

```bash
cd backend-rust
docker build -t forecap-backend-rust .
docker run --rm -p 4000:4000 --network forecap-net --name forecap-backend-rust \
  -e MYSQL_HOST=forecap-mysql \
  -e MYSQL_PASSWORD=rootpassword \
  -e REDIS_URL=redis://forecap-redis:6379 \
  forecap-backend-rust
```

## Endpoints

| Method | Path           | Description                  |
|--------|----------------|------------------------------|
| GET    | `/api/user-data` | Same payload as NestJS API   |
| GET    | `/health`        | Checks MySQL + Redis         |
| GET    | `/metrics`       | Prometheus metrics           |

## Load Testing

Point the existing k6 scripts at the Rust backend by setting `BASE_URL=http://localhost:4000` (and `SIGNATURE_SECRET` if used). Metrics are exposed on `/metrics`, so Prometheus/Grafana can scrape/compare latency and throughput vs. the Node backend.

