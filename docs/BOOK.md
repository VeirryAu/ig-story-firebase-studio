# Forecap 2025 - Complete Documentation

**A comprehensive guide to building, deploying, and scaling the Forecap 2025 Year Recap application**

---

## Table of Contents

### Part I: Introduction

1. [Overview](#chapter-1-overview)
2. [Architecture](#chapter-2-architecture)
3. [Tech Stack](#chapter-3-tech-stack)

### Part II: Frontend Development

4. [Getting Started](#chapter-4-getting-started)
5. [Project Structure](#chapter-5-project-structure)
6. [Key Features](#chapter-6-key-features)
7. [Component Guide](#chapter-7-component-guide)
8. [Configuration](#chapter-8-configuration)

### Part III: Backend Development

9. [Backend Setup](#chapter-9-backend-setup)
10. [Database Design](#chapter-10-database-design)
11. [API Development](#chapter-11-api-development)
12. [Data Import](#chapter-12-data-import)

### Part IV: Deployment

13. [Local Development](#chapter-13-local-development)
14. [Docker Deployment](#chapter-14-docker-deployment)
15. [EC2 Deployment](#chapter-15-ec2-deployment)
16. [ECS Fargate Deployment](#chapter-16-ecs-fargate-deployment)

### Part V: Performance & Monitoring

17. [Load Testing](#chapter-17-load-testing)
18. [Monitoring Setup](#chapter-18-monitoring-setup)
19. [Performance Optimization](#chapter-19-performance-optimization)

### Part VI: Operations

20. [Troubleshooting](#chapter-20-troubleshooting)
21. [Best Practices](#chapter-21-best-practices)
22. [FAQ](#chapter-22-faq)

---

## Chapter 1: Overview

### What is Forecap 2025?

Forecap 2025 is an interactive year-end recap experience for Fore Coffee customers. It displays personalized statistics, achievements, and highlights in a story format similar to Instagram Stories.

### Key Characteristics

- **Mobile-First**: Designed exclusively for mobile devices (no desktop breakpoints)
- **WebView Integration**: Runs in native Android and iOS WebView environments
- **Personalized Content**: Dynamic data from server responses
- **Offline Support**: Service Worker for asset caching
- **Native Bridge**: Communication with mobile apps for sharing and tracking

### Project Goals

- Serve **1 million active users** from December 8-31, 2025
- **High Performance**: <50ms response time (cached), <200ms (database)
- **Scalable Architecture**: Handle traffic spikes with auto-scaling
- **Cost Effective**: Optimized for minimal infrastructure costs

---

## Chapter 2: Architecture

### System Architecture

```
┌─────────────────┐
│  Mobile Apps    │  (Android/iOS WebView)
└────────┬────────┘
         │
┌────────▼────────┐
│  Next.js App    │  (Frontend - Static Assets)
│  (S3/CDN)       │
└────────┬────────┘
         │
┌────────▼────────┐
│  NestJS API     │  (Backend - EC2/Fargate)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼───┐
│ MySQL │ │Redis │  (Data Layer)
│ (RDS) │ │Cache │
└───────┘ └──────┘
```

### Data Flow

1. **User opens app** → Native app loads WebView
2. **WebView requests data** → API call with authentication headers
3. **API checks cache** → Redis cache lookup
4. **Cache miss** → Query MySQL database
5. **Store in cache** → Redis cache update
6. **Return data** → JSON response to frontend
7. **Render story** → Display personalized recap

### Key Design Decisions

- **Single Table Design**: Faster queries, lower cost, simpler maintenance
- **JSON Columns**: Process JSON in application (faster than MySQL functions)
- **Cache-Aside Pattern**: 80-90% cache hit rate expected
- **Connection Pooling**: Efficient database connection management
- **Horizontal Scaling**: Multiple API instances behind load balancer

---

## Chapter 3: Tech Stack

### Frontend

- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Screenshot**: html2canvas
- **i18n**: Custom translation system (Indonesian/English)

### Backend

- **Framework**: NestJS 10.3.0
- **Language**: TypeScript
- **Database**: MySQL 8.0+ (RDS)
- **Cache**: Redis 6.0+ (ElastiCache)
- **Metrics**: Prometheus + Grafana
- **Container**: Docker

### Infrastructure

- **Hosting**: AWS (EC2/ECS Fargate)
- **Database**: AWS RDS MySQL
- **Cache**: AWS ElastiCache Redis
- **CDN**: CloudFlare / AWS CloudFront
- **Monitoring**: Prometheus + Grafana

---

## Chapter 4: Getting Started

### Prerequisites

- Node.js 20+
- MySQL 8.0+
- Redis 6.0+
- Docker (optional, for containerized deployment)
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd forecap-2025

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install load testing tools
cd ../backend/load-test
npm install
```

### Quick Start

```bash
# Start frontend (port 9002)
npm run dev

# Start backend (port 3000)
cd backend
npm run start:dev

# Start monitoring (ports 3001, 9090)
cd ../monitoring
docker-compose up -d
```

### Verify Installation

```bash
# Frontend
curl http://localhost:9002

# Backend health
curl http://localhost:3000/health

# Backend metrics
curl http://localhost:3000/metrics

# Grafana
open http://localhost:3001  # admin/admin
```

---

## Chapter 5: Project Structure

```
forecap-2025/
├── src/                    # Frontend source code
│   ├── app/               # Next.js app directory
│   ├── components/         # React components
│   │   ├── screens/       # Story screen components
│   │   └── ui/            # Reusable UI components
│   ├── lib/               # Utilities and helpers
│   ├── hooks/             # Custom React hooks
│   └── i18n/              # Internationalization
│
├── backend/               # NestJS backend
│   ├── src/
│   │   ├── user/          # User module
│   │   ├── database/      # Database services
│   │   ├── metrics/       # Prometheus metrics
│   │   └── scripts/       # Import scripts
│   └── load-test/         # Load testing scripts
│
├── monitoring/            # Monitoring stack
│   ├── prometheus/        # Prometheus config
│   └── grafana/           # Grafana dashboards
│
├── scripts/               # Utility scripts
│   └── setup-mysql-schema-lean.sql
│
└── docs/                  # Documentation
    ├── BOOK.md           # This file
    ├── deployment-guide.md
    ├── import-data-guide.md
    └── ...
```

---

## Chapter 6: Key Features

### Frontend Features

1. **Story Viewer**
   - Instagram-like story navigation
   - Swipe gestures and tap zones
   - Progress bar with auto-advance
   - Keyboard navigation support

2. **Background Music**
   - Continuous playback across slides
   - Auto-unmute on video slide
   - User interaction unlock

3. **Video Support**
   - Full-screen video playback
   - Multiple format support (AV1, H.264, WebM)
   - Auto-play with sound

4. **Share Functionality**
   - Screenshot capture (base64)
   - Share to native apps
   - Screen picker modal (last slide)

5. **Native Bridge**
   - Close WebView
   - Share images/URLs
   - Track events
   - Handle deeplinks

6. **Authentication**
   - Header-based authentication
   - Timestamp validation
   - Signature verification

7. **Date Restriction**
   - Accessible until Dec 31, 2025
   - Bypass in development mode

### Backend Features

1. **RESTful API**
   - Single endpoint: `GET /api/user-data`
   - Authentication required
   - JSON response format

2. **Caching**
   - Redis cache-aside pattern
   - 1-hour TTL
   - Lock prevention (cache stampede)

3. **Metrics**
   - Prometheus metrics export
   - HTTP, database, cache metrics
   - Real-time monitoring

4. **Health Checks**
   - Database connectivity
   - Redis connectivity
   - Application status

---

## Chapter 7: Component Guide

### Story Viewer (`story-viewer.tsx`)

Main component managing story display and navigation.

**Key Features:**
- Slide management
- Navigation controls
- Progress tracking
- Video handling
- Share functionality
- Fullscreen mode support

**Props:**
```typescript
interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex?: number;
  onClose: () => void;
  serverResponse?: ServerResponse;
  fullscreenSlide?: string;
  fullscreenDuration?: number;
}
```

### Screen Components

Each screen is a React component in `src/components/screens/`:

- `screen-1.tsx` - Welcome screen with user name
- `screen-2.tsx` - Total cups (with transactions)
- `screen-2-notrx.tsx` - Total cups (no transactions)
- `screen-3.tsx` - Favorite products
- `screen-4.tsx` - Product persona
- `screen-5.tsx` - Fore points
- `screen-6.tsx` - Time-based persona
- `screen-7.tsx` - Favorite store
- `screen-8.tsx` - Delivery/Pickup preference
- `screen-9.tsx` - Other methods
- `screen-10.tsx` - Subscriber screen
- `screen-11.tsx` - Summary
- `screen-12.tsx` - Feature teaser
- `screen-13.tsx` - Video greeting

### Share Button (`share-button.tsx`)

Button component for sharing current slide.

**Features:**
- Screenshot capture
- Native bridge integration
- Tracking events

### Share Modal (`share-modal.tsx`)

Modal for selecting which slide to share (last slide only).

**Features:**
- Slide list display
- Share URL generation
- Loading states

---

## Chapter 8: Configuration

### Environment Variables

#### Frontend (`.env.local`)

```env
# Development mode
NEXT_PUBLIC_ENABLE_DEV_MODE=false

# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### Backend (`.env`)

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
```

### Configuration Files

#### `src/lib/const.json`

```json
{
  "devTrxCount": 100,
  "devMaxSlide": 13,
  "devPauseOnSlide": null,
  "slideDuration": 10000
}
```

#### `src/i18n/translations/`

Translation files for Indonesian (`id.json`) and English (`en.json`).

---

## Chapter 9: Backend Setup

### Installation

```bash
cd backend
npm install
```

### Database Setup

```bash
# Create database schema
mysql -u root -p < ../scripts/setup-mysql-schema-lean.sql
```

### Development Server

```bash
npm run start:dev
```

API will be available at `http://localhost:3000`

### API Documentation

Swagger UI available at `http://localhost:3000/api` (development only)

### Project Structure

```
backend/
├── src/
│   ├── main.ts              # Application entry
│   ├── app.module.ts        # Root module
│   ├── user/                # User module
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   ├── database/            # Database module
│   │   ├── database.service.ts
│   │   ├── redis.service.ts
│   │   └── database.module.ts
│   ├── metrics/             # Metrics module
│   │   ├── metrics.service.ts
│   │   ├── metrics.controller.ts
│   │   └── metrics.interceptor.ts
│   ├── auth/                # Authentication
│   ├── health/              # Health checks
│   └── scripts/            # Import scripts
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## Chapter 10: Database Design

### Schema Overview

**Single Table Design** for optimal performance:

```sql
CREATE TABLE user_recap_data (
    user_id INT UNSIGNED PRIMARY KEY,
    user_name VARCHAR(255),
    trx_count INT UNSIGNED,
    -- Scalar fields...
    list_product_favorite JSON,  -- Array of products
    list_favorite_store JSON,     -- Array of stores
    list_circular_images JSON     -- Array of images
) PARTITION BY HASH(user_id) PARTITIONS 16;
```

### Design Principles

1. **Single Table**: No JOINs, faster queries
2. **JSON Columns**: Arrays stored as JSON, parsed in app
3. **Partitioning**: Hash partitioning by user_id (16 partitions)
4. **Indexes**: Primary key on user_id, index on trx_count

### Benefits

- **Performance**: Single SELECT query (no JOINs)
- **Cost**: Less storage, fewer indexes
- **Simplicity**: Easier to maintain and query
- **Scalability**: Partitioning distributes load

### Data Types

- **Scalar Values**: Stored as regular columns (INT, VARCHAR, TEXT, DECIMAL)
- **Arrays**: Stored as JSON columns, parsed in application
- **Timestamps**: Created/updated timestamps for tracking

---

## Chapter 11: API Development

### API Endpoint

**GET /api/user-data**

Get user recap data by user_id.

**Headers:**
- `timestamp`: ISO 8601 timestamp (e.g., "2025-12-01T00:00:00Z")
- `user_id`: User ID (integer)
- `sign`: Base64(timestamp + "forecap2025" + user_id)

**Response:**
```json
{
  "userName": "John Doe",
  "trxCount": 100,
  "variantCount": 8,
  "listProductFavorite": [
    {
      "productName": "Espresso",
      "countCups": 25,
      "productImage": "https://..."
    }
  ],
  "listFavoriteStore": [
    {
      "storeName": "Fore Coffee Grand Indonesia",
      "transactionCount": 30,
      "storeImage": "https://..."
    }
  ],
  "totalPoint": 1250,
  "deliveryCount": 45,
  "pickupCount": 55,
  ...
}
```

### Authentication

Authentication is validated in `auth.utils.ts`:

1. Check required headers present
2. Validate timestamp (within 10 minutes)
3. Verify signature: `base64(timestamp + "forecap2025" + user_id)`

### Caching Strategy

1. **Cache Key**: `user:recap:{user_id}`
2. **TTL**: 1 hour (3600 seconds)
3. **Pattern**: Cache-aside with lock prevention
4. **Hit Rate Target**: 80-90%

### Error Handling

- **401 Unauthorized**: Invalid or missing authentication
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server error

---

## Chapter 12: Data Import

### Import Process

Import Excel data (from BigQuery) to MySQL:

```bash
cd backend
npm run import:excel ../results/forecap_2025_prototype.xlsx
```

### Excel File Format

Required columns:
- `user_id` (Number) - Required
- `user_name` (String) - Required
- `trx_count` (Number) - Required
- `listProductFavorite` (JSON String) - Optional
- `listFavoriteStore` (JSON String) - Optional
- Other fields as needed

### Import Script Features

- **Batch Processing**: 10,000 rows per batch
- **Transaction Safety**: Rollback on errors
- **Progress Tracking**: Real-time progress updates
- **Error Handling**: Continues on individual row errors
- **Performance**: ~350 rows/second

### Verification

```sql
-- Check total records
SELECT COUNT(*) FROM user_recap_data;

-- Check sample data
SELECT * FROM user_recap_data LIMIT 5;

-- Verify JSON columns
SELECT 
  user_id,
  JSON_LENGTH(list_product_favorite) as product_count
FROM user_recap_data
WHERE list_product_favorite IS NOT NULL
LIMIT 10;
```

---

## Chapter 13: Local Development

### Prerequisites

- Node.js 20+
- MySQL 8.0+
- Redis 6.0+

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

2. **Setup Database**
   ```bash
   mysql -u root -p < scripts/setup-mysql-schema-lean.sql
   ```

3. **Configure Environment**
   ```bash
   # Frontend: .env.local
   # Backend: backend/.env
   ```

4. **Start Services**
   ```bash
   # MySQL
   brew services start mysql  # macOS
   
   # Redis
   brew services start redis  # macOS
   
   # Frontend
   npm run dev
   
   # Backend
   cd backend && npm run start:dev
   ```

5. **Import Data**
   ```bash
   cd backend
   npm run import:excel ../results/forecap_2025_prototype.xlsx
   ```

### Development URLs

- Frontend: http://localhost:9002
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api
- Metrics: http://localhost:3000/metrics
- Health: http://localhost:3000/health

---

## Chapter 14: Docker Deployment

### Quick Start

```bash
cd backend
docker-compose up -d
```

This starts:
- **API**: NestJS application (port 3000)
- **MySQL**: Database (port 3306)
- **Redis**: Cache (port 6379)

### Production Build

```bash
# Build image
docker build -t forecap-api .

# Run container
docker run -d \
  --name forecap-api \
  -p 3000:3000 \
  -e MYSQL_HOST=your-host \
  -e REDIS_HOST=your-redis \
  forecap-api
```

### Docker Compose Services

```yaml
services:
  api:        # NestJS API
  mysql:      # MySQL database
  redis:      # Redis cache
```

All services include health checks and auto-restart.

---

## Chapter 15: EC2 Deployment

### Prerequisites

- AWS Account
- EC2 key pair
- RDS MySQL instance
- ElastiCache Redis instance

### Step 1: Launch EC2 Instance

```bash
aws ec2 run-instances \
  --image-id ami-xxx \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxx
```

### Step 2: Install Docker

```bash
ssh -i key.pem ec2-user@your-instance-ip

sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user
```

### Step 3: Deploy Application

```bash
git clone your-repo
cd forecap-2025/backend

# Create .env file
cat > .env << EOF
MYSQL_HOST=your-rds-endpoint
REDIS_HOST=your-redis-endpoint
NODE_ENV=production
EOF

# Build and run
docker build -t forecap-api .
docker run -d --name forecap-api -p 3000:3000 --env-file .env forecap-api
```

### Step 4: Setup Nginx (Optional)

```nginx
server {
    listen 80;
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

### Auto-Scaling

Configure auto-scaling group for multiple instances behind load balancer.

---

## Chapter 16: ECS Fargate Deployment

### Prerequisites

- AWS Account
- ECR repository
- RDS MySQL
- ElastiCache Redis
- VPC with subnets

### Step 1: Build and Push Image

```bash
# Build
docker build -t forecap-api .

# Login to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com

# Tag and push
docker tag forecap-api:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/forecap-api:latest
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/forecap-api:latest
```

### Step 2: Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name forecap-cluster
```

### Step 3: Register Task Definition

```bash
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json
```

### Step 4: Create Service

```bash
aws ecs create-service \
  --cluster forecap-cluster \
  --service-name forecap-api \
  --task-definition forecap-api \
  --desired-count 2 \
  --launch-type FARGATE
```

### Step 5: Setup Load Balancer

Create Application Load Balancer and target group for traffic distribution.

### Auto-Scaling

Configure auto-scaling based on CPU/memory metrics:

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/forecap-cluster/forecap-api \
  --min-capacity 2 \
  --max-capacity 10
```

---

## Chapter 17: Load Testing

### Tools

- **K6** (Recommended): JavaScript-based, excellent metrics
- **Artillery**: YAML-based, easy configuration

### K6 Setup

```bash
# Install
brew install k6  # macOS

# Run tests
cd backend/load-test
k6 run k6-test.js                    # Load test
SCENARIO=stress k6 run k6-test.js    # Stress test
SCENARIO=spike k6 run k6-test.js     # Spike test
```

### Test Scenarios

1. **Smoke Test**: 1 user, 1 minute (baseline)
2. **Load Test**: Ramp to 100 users (normal load)
3. **Stress Test**: Ramp to 300 users (high load)
4. **Spike Test**: Sudden spike to 500 users (traffic spike)

### Performance Benchmarks

| Metric | Target | Good | Excellent |
|--------|--------|------|-----------|
| p50 Response | < 50ms | < 30ms | < 20ms |
| p95 Response | < 200ms | < 100ms | < 50ms |
| p99 Response | < 500ms | < 200ms | < 100ms |
| Throughput | > 500 RPS | > 1000 RPS | > 2000 RPS |
| Error Rate | < 1% | < 0.1% | < 0.01% |

### When to Consider Go/Rust

Consider alternatives if NestJS shows:
- p95 > 500ms under load
- < 500 RPS with 100 concurrent users
- > 2GB memory per instance
- > 80% CPU under normal load

**Comparison:**
- **NestJS**: Good for rapid development, TypeScript ecosystem
- **Go**: Better performance, lower memory, good concurrency
- **Rust**: Maximum performance, lowest memory, steep learning curve

---

## Chapter 18: Monitoring Setup

### Quick Start

```bash
cd monitoring
docker-compose up -d
```

### Access Dashboards

- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

### Metrics Endpoint

Your API exposes metrics at `/metrics`:

```bash
curl http://localhost:3000/metrics
```

### Dashboard Panels

1. **Request Rate (RPS)** - Requests per second
2. **Response Time** - p50, p95, p99 percentiles
3. **Error Rate** - Failed requests over time
4. **Cache Hit Rate** - Redis cache effectiveness
5. **Database Connection Pool** - Active/idle connections
6. **Database Query Duration** - Query performance
7. **CPU Usage** - System CPU utilization
8. **Memory Usage** - System memory usage

### During Load Testing

1. Start monitoring: `docker-compose up -d`
2. Start API: `npm run start:dev`
3. Run load test: `k6 run k6-test.js`
4. Watch Grafana: Real-time metrics update every 5 seconds

### Key Metrics to Watch

- **Response Time**: Should stay < 200ms (p95)
- **Error Rate**: Should stay < 1%
- **Cache Hit Rate**: Should be > 80%
- **CPU Usage**: Should stay < 80%
- **Memory Usage**: Should stay < 80%

---

## Chapter 19: Performance Optimization

### Database Optimization

1. **Indexes**: Primary key on user_id, index on trx_count
2. **Partitioning**: Hash partitioning by user_id (16 partitions)
3. **Connection Pooling**: 20 connections per instance
4. **Query Optimization**: Single query, no JOINs

### Cache Optimization

1. **TTL**: 1 hour (balance freshness vs hit rate)
2. **Lock Prevention**: Prevents cache stampede
3. **Memory Policy**: LRU eviction for memory management
4. **Hit Rate Target**: 80-90%

### Application Optimization

1. **Connection Pooling**: Reuse database connections
2. **JSON Parsing**: Done in application (faster than MySQL)
3. **Response Compression**: Enable gzip/brotli
4. **HTTP/2**: Enable for multiplexing

### Infrastructure Optimization

1. **Read Replicas**: Distribute read load
2. **CDN**: Cache static assets
3. **Auto-Scaling**: Scale based on CPU/memory
4. **Load Balancing**: Distribute traffic evenly

---

## Chapter 20: Troubleshooting

### Common Issues

#### Frontend

**Service Worker Issues:**
- Clear cache: DevTools > Application > Clear Storage
- Unregister: Application > Service Workers > Unregister

**Screenshot Not Working:**
- Check html2canvas installation
- Verify CORS headers
- Check element visibility

**Native Bridge Not Working:**
- Verify WebView environment
- Check bridge setup in native app
- Check console logs

#### Backend

**Connection Errors:**
- Verify MySQL/Redis are running
- Check connection settings in `.env`
- Verify network connectivity

**High Response Times:**
- Check database query performance
- Verify cache hit rate
- Check connection pool usage
- Monitor CPU/memory

**Import Errors:**
- Check Excel file format
- Verify JSON field format
- Check database permissions
- Reduce batch size if memory issues

### Debugging Tips

1. **Check Logs**: Application logs, database logs, Redis logs
2. **Monitor Metrics**: Grafana dashboard for real-time metrics
3. **Test Endpoints**: Use curl to test API endpoints
4. **Verify Data**: Check database directly with SQL queries

---

## Chapter 21: Best Practices

### Development

1. **Type Safety**: Use TypeScript for all code
2. **Error Handling**: Always handle errors gracefully
3. **Logging**: Use structured logging
4. **Testing**: Test on mobile devices
5. **Documentation**: Keep docs updated

### Deployment

1. **Environment Variables**: Never commit secrets
2. **Health Checks**: Implement health check endpoints
3. **Monitoring**: Set up monitoring before production
4. **Backups**: Regular database backups
5. **Rolling Updates**: Deploy with zero downtime

### Performance

1. **Caching**: Cache aggressively (80-90% hit rate)
2. **Connection Pooling**: Reuse connections
3. **Query Optimization**: Single queries, no JOINs
4. **Resource Limits**: Set appropriate limits
5. **Auto-Scaling**: Configure based on metrics

### Security

1. **Authentication**: Always validate authentication
2. **Input Validation**: Validate all inputs
3. **SQL Injection**: Use parameterized queries
4. **Secrets Management**: Use AWS Secrets Manager
5. **HTTPS**: Always use HTTPS in production

---

## Chapter 22: FAQ

### General

**Q: Can I use this for other projects?**
A: Yes, the architecture is generic and can be adapted.

**Q: What's the expected cost for 1M users?**
A: ~$490/month (EC2) or ~$490/month (Fargate) + database costs.

**Q: How do I extend the date restriction?**
A: Update `checkDateRestriction()` in `src/lib/auth.ts`.

### Technical

**Q: Why single table instead of normalized?**
A: Faster queries (no JOINs), lower cost, simpler maintenance.

**Q: Why JSON columns instead of separate tables?**
A: Faster (parsed in app), simpler queries, less storage.

**Q: Can I use PostgreSQL instead of MySQL?**
A: Yes, but you'll need to update the database service and schema.

**Q: How do I add more metrics?**
A: Add to `MetricsService` in `backend/src/metrics/metrics.service.ts`.

### Deployment

**Q: Which deployment option is best?**
A: ECS Fargate for no server management, EC2 for cost optimization.

**Q: How do I scale horizontally?**
A: Increase desired count in ECS or add instances to auto-scaling group.

**Q: How do I monitor in production?**
A: Use CloudWatch (AWS) or Prometheus + Grafana (self-hosted).

### Performance

**Q: What if NestJS doesn't meet performance requirements?**
A: Consider Go (Gin) or Rust (Actix) - see load testing guide.

**Q: How do I improve cache hit rate?**
A: Increase TTL, pre-warm cache, optimize cache keys.

**Q: How do I reduce database load?**
A: Increase cache TTL, add read replicas, optimize queries.

---

## Appendix A: API Reference

See [OpenAPI Specification](./api/openapi.yaml) for complete API documentation.

## Appendix B: Environment Variables

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_ENABLE_DEV_MODE` | Enable dev features | `false` |
| `NEXT_PUBLIC_API_URL` | API endpoint URL | - |

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `MYSQL_HOST` | MySQL host | `localhost` |
| `MYSQL_DATABASE` | Database name | `forecap_db` |
| `MYSQL_USER` | Database user | `root` |
| `MYSQL_PASSWORD` | Database password | - |
| `MYSQL_CONNECTION_LIMIT` | Connection pool size | `20` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | - |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `ALLOWED_ORIGINS` | CORS origins | `*` |

## Appendix C: Useful Commands

### Development

```bash
# Frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Backend
npm run start:dev        # Start dev server
npm run build            # Build
npm run start:prod       # Start production
npm run import:excel     # Import data
```

### Docker

```bash
docker-compose up -d     # Start services
docker-compose down      # Stop services
docker-compose logs -f   # View logs
docker-compose ps        # Check status
```

### Database

```bash
mysql -u root -p         # Connect to MySQL
redis-cli                # Connect to Redis
```

### Load Testing

```bash
k6 run k6-test.js                    # Load test
SCENARIO=stress k6 run k6-test.js    # Stress test
artillery run artillery-test.yml      # Artillery test
```

### Monitoring

```bash
cd monitoring
docker-compose up -d     # Start monitoring
docker-compose logs -f   # View logs
```

## Appendix D: Cost Estimation

### AWS Costs (Monthly)

**EC2 Deployment:**
- EC2 (2x t3.medium): $120
- ALB: $20
- RDS MySQL (db.r5.large): $200
- ElastiCache Redis (cache.r6g.large): $150
- **Total: ~$490/month**

**ECS Fargate:**
- Fargate (2 tasks, 1 vCPU, 2GB): $120
- ALB: $20
- RDS MySQL: $200
- ElastiCache Redis: $150
- **Total: ~$490/month**

### Traffic-Based Costs

For 1M users over 24 days:
- **With 80% cache hit rate**: ~$900/month
- **Without caching**: ~$3,700/month

## Appendix E: Quick Reference

### Important URLs

- Frontend: http://localhost:9002
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api
- Metrics: http://localhost:3000/metrics
- Health: http://localhost:3000/health
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090

### Key Files

- Frontend entry: `src/app/page.tsx`
- Story viewer: `src/components/story-viewer.tsx`
- Backend entry: `backend/src/main.ts`
- Database service: `backend/src/database/database.service.ts`
- API endpoint: `backend/src/user/user.controller.ts`

### Support

For issues or questions:
1. Check this documentation
2. Review troubleshooting section
3. Check GitHub issues
4. Contact development team

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready

