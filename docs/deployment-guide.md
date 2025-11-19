# Complete Deployment Guide

This guide covers all deployment options for the Forecap 2025 backend API.

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [EC2 Deployment](#ec2-deployment)
4. [ECS Fargate Deployment](#ecs-fargate-deployment)

---

## Local Development

### Prerequisites

- Node.js 20+
- MySQL 8.0+
- Redis 6.0+
- npm or yarn

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Setup Database

```bash
# Create database and schema
mysql -u root -p < ../scripts/setup-mysql-schema-lean.sql
```

### Step 3: Configure Environment

Create `.env` file in `backend/` directory:

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

### Step 4: Start Services

```bash
# Start MySQL (if not running)
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql

# Start Redis (if not running)
# macOS: brew services start redis
# Linux: sudo systemctl start redis

# Start NestJS application
npm run start:dev
```

### Step 5: Verify

```bash
# Check health endpoint
curl http://localhost:3000/health

# Check API documentation
open http://localhost:3000/api
```

### Troubleshooting

- **Port already in use**: Change `PORT` in `.env` or kill process using port 3000
- **MySQL connection error**: Verify MySQL is running and credentials are correct
- **Redis connection error**: Verify Redis is running on port 6379

---

## Docker Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Step 1: Setup Environment

Create `.env` file in `backend/` directory (same as local development).

### Step 2: Build and Run

```bash
cd backend

# Build and start all services (MySQL, Redis, API)
docker-compose up -d

# View logs
docker-compose logs -f api

# Check status
docker-compose ps
```

### Step 3: Import Data

```bash
# Import Excel data (from host machine)
cd backend
npm install
npm run import:excel ../results/forecap_2025_prototype.xlsx
```

Or import from within container:

```bash
# Copy Excel file to container
docker cp ../results/forecap_2025_prototype.xlsx forecap-api:/app/data.xlsx

# Execute import inside container
docker exec -it forecap-api npm run import:excel /app/data.xlsx
```

### Step 4: Verify

```bash
# Health check
curl http://localhost:3000/health

# Test API
curl -H "user_id: 1" -H "timestamp: 2025-12-01T00:00:00Z" -H "sign: ..." \
  http://localhost:3000/api/user-data
```

### Step 5: Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Production Docker Build

```bash
# Build production image
docker build -t forecap-api:latest .

# Run container
docker run -d \
  --name forecap-api \
  -p 3000:3000 \
  -e MYSQL_HOST=your-mysql-host \
  -e MYSQL_DATABASE=forecap_db \
  -e MYSQL_USER=admin \
  -e MYSQL_PASSWORD=your_password \
  -e REDIS_HOST=your-redis-host \
  -e REDIS_PORT=6379 \
  -e NODE_ENV=production \
  forecap-api:latest
```

### Docker Compose Services

- **api**: NestJS application (port 3000)
- **mysql**: MySQL 8.0 database (port 3306)
- **redis**: Redis 7 cache (port 6379)

All services are configured with health checks and auto-restart.

---

## EC2 Deployment

### Prerequisites

- AWS Account
- AWS CLI configured
- EC2 key pair
- RDS MySQL instance
- ElastiCache Redis instance

### Step 1: Launch EC2 Instance

```bash
# Launch t3.medium instance (recommended minimum)
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxxx \
  --subnet-id subnet-xxxxxxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=forecap-api}]'
```

### Step 2: Connect to Instance

```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

### Step 3: Install Docker

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes
exit
```

### Step 4: Clone and Setup

```bash
# Install Git
sudo yum install git -y

# Clone repository
git clone your-repo-url
cd forecap-2025/backend

# Create .env file
cat > .env << EOF
MYSQL_HOST=your-rds-endpoint.amazonaws.com
MYSQL_DATABASE=forecap_db
MYSQL_USER=admin
MYSQL_PASSWORD=your_secure_password
REDIS_HOST=your-elasticache-endpoint.cache.amazonaws.com
REDIS_PORT=6379
NODE_ENV=production
PORT=3000
EOF
```

### Step 5: Build and Run

```bash
# Build Docker image
docker build -t forecap-api .

# Run container
docker run -d \
  --name forecap-api \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  forecap-api:latest
```

### Step 6: Setup Nginx (Optional)

```bash
# Install Nginx
sudo yum install nginx -y

# Configure Nginx
sudo nano /etc/nginx/conf.d/forecap.conf
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 7: Setup Auto-Scaling (Optional)

Create launch template and auto-scaling group for multiple instances behind a load balancer.

### Monitoring

```bash
# View logs
docker logs -f forecap-api

# Check resource usage
docker stats forecap-api

# System monitoring
htop
```

---

## ECS Fargate Deployment

### Prerequisites

- AWS Account
- AWS CLI configured
- ECR repository
- RDS MySQL instance
- ElastiCache Redis instance
- VPC with subnets

### Step 1: Create ECR Repository

```bash
# Create repository
aws ecr create-repository \
  --repository-name forecap-api \
  --region ap-southeast-1

# Get login token
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com
```

### Step 2: Build and Push Image

```bash
cd backend

# Build image
docker build -t forecap-api .

# Tag image
docker tag forecap-api:latest \
  YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/forecap-api:latest

# Push image
docker push \
  YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/forecap-api:latest
```

### Step 3: Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name forecap-cluster \
  --region ap-southeast-1
```

### Step 4: Create Task Definition

Update `ecs-task-definition.json` with your ECR image URI and secrets ARNs:

```bash
# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json \
  --region ap-southeast-1
```

### Step 5: Create Application Load Balancer

```bash
# Create target group
aws elbv2 create-target-group \
  --name forecap-api-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxxxxxx \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region ap-southeast-1

# Create load balancer
aws elbv2 create-load-balancer \
  --name forecap-api-lb \
  --subnets subnet-xxxxxxxxx subnet-yyyyyyyyy \
  --security-groups sg-xxxxxxxxx \
  --region ap-southeast-1

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:... \
  --region ap-southeast-1
```

### Step 6: Create ECS Service

```bash
aws ecs create-service \
  --cluster forecap-cluster \
  --service-name forecap-api \
  --task-definition forecap-api \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=forecap-api,containerPort=3000" \
  --region ap-southeast-1
```

### Step 7: Setup Auto-Scaling

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/forecap-cluster/forecap-api \
  --min-capacity 2 \
  --max-capacity 10 \
  --region ap-southeast-1

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/forecap-cluster/forecap-api \
  --policy-name forecap-api-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }' \
  --region ap-southeast-1
```

### Step 8: Verify Deployment

```bash
# Get load balancer DNS
aws elbv2 describe-load-balancers \
  --names forecap-api-lb \
  --region ap-southeast-1 \
  --query 'LoadBalancers[0].DNSName' \
  --output text

# Test health endpoint
curl http://LOAD_BALANCER_DNS/health

# View service status
aws ecs describe-services \
  --cluster forecap-cluster \
  --services forecap-api \
  --region ap-southeast-1
```

### Monitoring

```bash
# View CloudWatch logs
aws logs tail /ecs/forecap-api --follow --region ap-southeast-1

# View service metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=forecap-api \
  --start-time 2025-12-01T00:00:00Z \
  --end-time 2025-12-01T23:59:59Z \
  --period 3600 \
  --statistics Average \
  --region ap-southeast-1
```

---

## Comparison Table

| Feature | Local | Docker | EC2 | ECS Fargate |
|---------|-------|--------|-----|-------------|
| **Setup Time** | 5 min | 10 min | 30 min | 45 min |
| **Cost** | Free | Free | ~$60/month | ~$120/month |
| **Scalability** | Manual | Manual | Auto-scaling | Auto-scaling |
| **Management** | Full | Medium | High | Low |
| **Best For** | Development | Testing | Production | Production |

---

## Next Steps

- [Import Data Guide](./import-data-guide.md)
- [Load Testing Guide](./load-testing-guide.md)
- [Performance Tuning](./performance-tuning.md)

