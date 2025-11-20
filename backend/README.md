# Forecap 2025 Backend API

NestJS backend API for serving user recap data. Designed to handle millions of users with lean single-table database design and containerized deployment (EC2/Fargate).

## Features

- ✅ **NestJS Framework** - Modern, scalable Node.js framework
- ✅ **Lean Database Design** - Single table with JSON columns for faster queries
- ✅ **JSON Processing in App** - Faster than MySQL JSON functions
- ✅ **MySQL Integration** - Connection pooling, optimized queries
- ✅ **Redis Caching** - Cache-aside pattern with lock prevention
- ✅ **Docker Support** - Ready for EC2/Fargate deployment
- ✅ **Batch Import** - Excel to MySQL import script
- ✅ **Health Checks** - Database and Redis monitoring
- ✅ **Swagger Documentation** - API documentation

## Quick Start

### Installation

```bash
cd backend
npm install
```

## Testing

### Run Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests (e2e)
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

### Test Coverage

- **Minimum Coverage:** 70% (branches, functions, lines, statements)
- **Coverage Report:** `coverage/index.html`

See [TESTING.md](./TESTING.md) for detailed testing guide.

## Logging

### View Logs in Docker

```bash
# Follow logs in real-time
docker compose logs -f api

# View errors only
docker compose logs api | grep ERROR

# View last 100 lines
docker compose logs --tail=100 api

# Use helper script
./scripts/view-logs.sh errors
./scripts/view-logs.sh user 12345
./scripts/view-logs.sh stats
```

See [DOCKER_LOGGING.md](./DOCKER_LOGGING.md) for complete logging guide.

### Environment Variables

Create `.env` file:

```env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_DATABASE=forecap_db
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_CONNECTION_LIMIT=20

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Server Configuration
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:9002

# Authentication (optional)
# AUTH_SIGNATURE_SECRET=forecap2025
```

### Development

```bash
# Start development server
npm run start:dev

# API will be available at http://localhost:3000
# Swagger docs at http://localhost:3000/api
```

### Import Excel Data

```bash
# Import Excel file to MySQL
npm run import:excel ../results/forecap_2025_prototype.xlsx
```

## API Endpoints

### GET /api/user-data

Get user recap data by user_id.

**Headers:**
- `timestamp`: ISO 8601 timestamp
- `user_id`: User ID (integer)
- `sign`: `base64(timestamp + user_id)` (if you set `AUTH_SIGNATURE_SECRET`, append it between timestamp and user_id)

**Response:**
```json
{
  "userName": "John Doe",
  "trxCount": 100,
  "variantCount": 8,
  "listProductFavorite": [...],
  "listFavoriteStore": [...],
  ...
}
```

## Docker Deployment

### Local Development

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

> **MySQL tuning:** Docker Compose automatically mounts `./mysql/conf.d/tuning.cnf`, which sets a 2 GB buffer pool, larger redo logs, and other defaults sized for ~2M MAU traffic. Adjust these values (or copy them into your RDS parameter group) if you change instance sizes.

### Rust Backend (Optional)

The compose file also includes a Rust implementation of the API. Run it side-by-side for benchmarking:

```bash
# Build and run only the Rust service
docker-compose up -d rust-api

# Tail logs
docker-compose logs -f rust-api
```

It exposes the same endpoints on `http://localhost:4000`, including `/metrics`, so you can point k6 and Prometheus at it to compare throughput/latency.

### Go Backend (Optional)

The Go implementation (Gin + go-redis + database/sql) is built for parity with NestJS/Rust. Use it to evaluate Go latency/cost under the same workload:

```bash
# Build and run only the Go service
docker-compose up -d go-api

# Tail logs
docker-compose logs -f go-api
```

It listens on `http://localhost:4001` and exports Prometheus metrics with `service="forecap-api-go"`, so monitoring dashboards show NestJS vs Rust vs Go side-by-side.

### Production Build

```bash
# Build Docker image
docker build -t forecap-api .

# Run container
docker run -d \
  -p 3000:3000 \
  -e MYSQL_HOST=your-rds-endpoint \
  -e MYSQL_DATABASE=forecap_db \
  -e REDIS_HOST=your-redis-endpoint \
  forecap-api
```

## EC2 / Fargate Deployment

See [EC2/Fargate Deployment Guide](../docs/ec2-fargate-deployment.md) for detailed instructions.

### Quick Start (ECS Fargate)

```bash
# Build and push to ECR
docker build -t forecap-api .
aws ecr get-login-password | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com
docker tag forecap-api:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/forecap-api:latest
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/forecap-api:latest

# Deploy to ECS
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
aws ecs create-service --cluster your-cluster --service-name forecap-api --task-definition forecap-api
```

## Architecture

### Request Flow

```
Client Request
    ↓
API Gateway / Load Balancer
    ↓
NestJS Handler (Lambda/Container)
    ↓
Redis Cache Check (Cache-Aside)
    ↓ (miss)
MySQL Database (with connection pool)
    ↓
Redis Cache Store
    ↓
Response to Client
```

### Scaling Strategy

1. **Horizontal Scaling**: Multiple Lambda instances (auto-scaling)
2. **Connection Pooling**: Shared MySQL connection pool
3. **Redis Caching**: 80-90% cache hit rate expected
4. **Read Replicas**: MySQL read replicas for read-heavy workloads

## Performance

- **Expected RPS**: 1,000-1,500 requests/second
- **Response Time**: <50ms (cached), <200ms (database)
- **Cache Hit Rate**: 80-90%
- **Concurrent Users**: 1M+ users over 24 days

## Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

### Metrics to Monitor

- API response time (p50, p95, p99)
- Cache hit rate
- Database connection pool usage
- Lambda cold starts
- Error rate

## Cost Estimation (AWS)

- **Lambda**: ~$0.20 per 1M requests = ~$200/month
- **API Gateway**: ~$3.50 per 1M requests = ~$350/month
- **RDS MySQL**: db.r5.xlarge = ~$400/month
- **ElastiCache Redis**: cache.r6g.large = ~$150/month
- **Total**: ~$1,100/month

## Development

### Project Structure

```
backend/
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.module.ts        # Root module
│   ├── user/                # User module
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   ├── database/            # Database module
│   │   ├── database.service.ts
│   │   ├── redis.service.ts
│   │   └── database.module.ts
│   ├── auth/                # Authentication utilities
│   ├── health/              # Health checks
│   └── scripts/             # Import scripts
│       └── import-excel.ts
├── serverless.yml           # Serverless configuration
└── package.json
```

## Troubleshooting

### Connection Issues

- Check MySQL is accessible from Lambda VPC
- Verify security group allows connections
- Check Redis endpoint is correct

### Cold Starts

- Use provisioned concurrency (AWS Lambda)
- Keep Lambda warm with scheduled pings
- Use connection pooling

### Memory Issues

- Increase Lambda memory (512MB → 1024MB)
- Optimize batch sizes
- Monitor connection pool size

