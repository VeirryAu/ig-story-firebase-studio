# Serverless Deployment Guide

This guide covers deploying the NestJS backend to various serverless platforms.

## Overview

The backend is designed to be serverless-compatible and can handle millions of requests with:
- **Auto-scaling**: Automatically scales based on traffic
- **Pay-per-use**: Only pay for actual requests
- **No server management**: Platform handles infrastructure

## Supported Platforms

1. **AWS Lambda** (Recommended)
2. **Google Cloud Functions**
3. **Vercel**
4. **Netlify Functions**

## AWS Lambda Deployment

### Prerequisites

```bash
npm install -g serverless
aws configure  # Set up AWS credentials
```

### Configuration

1. **Set up VPC** (if MySQL/Redis are in private subnet):
   - Create VPC with subnets
   - Create security group allowing MySQL (3306) and Redis (6379)
   - Note: Security group IDs and subnet IDs

2. **Set environment variables:**
```bash
export MYSQL_HOST=your-rds-endpoint.amazonaws.com
export MYSQL_DATABASE=forecap_db
export MYSQL_USER=admin
export MYSQL_PASSWORD=your_secure_password
export REDIS_HOST=your-elasticache-endpoint.cache.amazonaws.com
export REDIS_PORT=6379
export VPC_SECURITY_GROUP_ID=sg-xxxxxxxxx
export VPC_SUBNET_ID_1=subnet-xxxxxxxxx
export VPC_SUBNET_ID_2=subnet-yyyyyyyyy
```

3. **Deploy:**
```bash
cd backend
npm install
npm run build
serverless deploy
```

### Performance Optimization

1. **Provisioned Concurrency** (reduce cold starts):
```yaml
# serverless.yml
functions:
  api:
    provisionedConcurrency: 10  # Keep 10 instances warm
```

2. **Reserved Concurrency** (limit max instances):
```yaml
functions:
  api:
    reservedConcurrentExecutions: 100
```

3. **Memory Configuration**:
```yaml
provider:
  memorySize: 1024  # Increase for better performance
```

### Cost Estimation

- **1M requests/month**: ~$200 (Lambda) + ~$350 (API Gateway) = **$550/month**
- **With provisioned concurrency**: +$50/month = **$600/month**

## Google Cloud Functions

### Deployment

```bash
# Install Google Cloud SDK
gcloud init

# Deploy
cd backend
npm run build
gcloud functions deploy forecap-api \
  --runtime nodejs20 \
  --trigger http \
  --allow-unauthenticated \
  --memory 512MB \
  --timeout 30s \
  --max-instances 100 \
  --set-env-vars MYSQL_HOST=...,MYSQL_DATABASE=...,REDIS_HOST=...
```

### VPC Configuration

```bash
# Connect function to VPC (for private MySQL/Redis)
gcloud functions deploy forecap-api \
  --vpc-connector projects/PROJECT_ID/locations/REGION/connectors/CONNECTOR_NAME \
  --egress-settings all-traffic
```

## Vercel Deployment

### Configuration

1. **Create `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "backend/dist/main.js"
    }
  ],
  "env": {
    "MYSQL_HOST": "@mysql-host",
    "MYSQL_DATABASE": "@mysql-database",
    "REDIS_HOST": "@redis-host"
  }
}
```

2. **Deploy:**
```bash
npm install -g vercel
cd backend
npm run build
vercel --prod
```

## Performance Considerations

### Cold Starts

**Problem**: First request after idle period takes longer (1-3 seconds)

**Solutions**:
1. **Provisioned Concurrency** (AWS Lambda) - Keep instances warm
2. **Scheduled Pings** - Ping endpoint every 5 minutes
3. **Connection Pooling** - Reuse connections across invocations

### Connection Pooling

**Important**: Lambda functions are stateless, but connections can be reused within the same container.

```typescript
// database.service.ts
let pool: mysql.Pool | null = null;

// Reuse pool across invocations
if (!pool) {
  pool = mysql.createPool(config);
}
```

### Memory Limits

- **512MB**: Good for most use cases
- **1024MB**: Better for batch operations
- **2048MB**: For heavy processing

## Monitoring

### AWS CloudWatch

```bash
# View logs
aws logs tail /aws/lambda/forecap-backend-dev-api --follow

# Set up alarms
aws cloudwatch put-metric-alarm \
  --alarm-name high-error-rate \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

### Key Metrics

- **Invocation count**: Total requests
- **Duration**: Response time (p50, p95, p99)
- **Errors**: Error rate
- **Cold starts**: Number of cold starts
- **Throttles**: When hitting concurrency limits

## Scaling Limits

### AWS Lambda

- **Default concurrency**: 1,000 per region
- **Can request increase**: Up to 10,000+
- **Reserved concurrency**: Limit specific function

### Google Cloud Functions

- **Default max instances**: 80
- **Can configure**: Up to 1,000
- **Timeout**: 60 seconds (Gen 1), 540 seconds (Gen 2)

## Best Practices

1. **Keep functions warm**: Use provisioned concurrency or scheduled pings
2. **Optimize cold starts**: Minimize dependencies, use connection pooling
3. **Monitor costs**: Set up billing alerts
4. **Use caching**: Redis reduces database load significantly
5. **Error handling**: Implement retry logic and circuit breakers
6. **Logging**: Use structured logging for better debugging

## Troubleshooting

### Connection Timeouts

- Check VPC configuration
- Verify security group rules
- Test connectivity from Lambda to MySQL/Redis

### Cold Start Issues

- Increase memory allocation
- Use provisioned concurrency
- Optimize bundle size

### Memory Errors

- Increase Lambda memory
- Optimize batch sizes
- Check for memory leaks

## Cost Optimization

1. **Right-size memory**: Start with 512MB, increase if needed
2. **Optimize code**: Reduce execution time = lower cost
3. **Use caching**: Reduce database calls
4. **Reserved capacity**: For predictable traffic

## Example: 1M Users Over 24 Days

**Traffic Pattern:**
- Peak: 1,000-1,500 RPS
- Average: 500 RPS
- Total requests: ~1B requests

**Cost (AWS Lambda):**
- Lambda: ~$200
- API Gateway: ~$3,500
- **Total: ~$3,700/month**

**With caching (80% hit rate):**
- API Gateway: ~$700 (only 20% hit DB)
- **Total: ~$900/month**

