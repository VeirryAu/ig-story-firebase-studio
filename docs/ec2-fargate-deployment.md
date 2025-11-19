# EC2 / Fargate Deployment Guide

This guide covers deploying the NestJS backend to AWS EC2 or ECS Fargate.

## Overview

The backend is optimized for containerized deployment with:
- **Single table design**: Faster queries, lower cost
- **JSON processing in app**: Better performance than MySQL JSON functions
- **Docker support**: Ready for containerization
- **Health checks**: Built-in monitoring

## Architecture Options

### Option 1: ECS Fargate (Recommended)

**Pros:**
- No server management
- Auto-scaling
- Pay only for running containers
- High availability

**Cons:**
- Slightly more expensive than EC2
- Less control over infrastructure

### Option 2: EC2 with Docker

**Pros:**
- Full control
- Lower cost for high traffic
- Can optimize instance types

**Cons:**
- Need to manage servers
- Manual scaling
- More operational overhead

## Database Design (Lean Single Table)

### Schema

```sql
CREATE TABLE user_recap_data (
    user_id INT UNSIGNED PRIMARY KEY,
    user_name VARCHAR(255),
    trx_count INT UNSIGNED,
    -- ... other fields ...
    list_product_favorite JSON,  -- Stored as JSON
    list_favorite_store JSON,     -- Stored as JSON
    list_circular_images JSON     -- Stored as JSON
) PARTITION BY HASH(user_id) PARTITIONS 16;
```

### Benefits

1. **Single Query**: One SELECT instead of 3 JOINs
2. **Faster**: No JOIN overhead
3. **Cheaper**: Less storage, fewer indexes
4. **Simpler**: Easier to maintain

### JSON Processing

- **Storage**: JSON stored as TEXT/JSON column
- **Parsing**: Done in application (Node.js is fast)
- **Performance**: Faster than MySQL JSON functions

## ECS Fargate Deployment

### Prerequisites

```bash
# Install AWS CLI
aws --version

# Install Docker
docker --version

# Configure AWS credentials
aws configure
```

### Step 1: Build and Push Docker Image

```bash
# Build Docker image
cd backend
docker build -t forecap-api .

# Create ECR repository
aws ecr create-repository --repository-name forecap-api --region ap-southeast-1

# Get login token
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com

# Tag and push
docker tag forecap-api:latest YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/forecap-api:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/forecap-api:latest
```

### Step 2: Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name forecap-cluster --region ap-southeast-1
```

### Step 3: Create Task Definition

```bash
# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json \
  --region ap-southeast-1
```

### Step 4: Create Service

```bash
# Create ECS service
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

### Step 5: Set Up Application Load Balancer

```bash
# Create target group
aws elbv2 create-target-group \
  --name forecap-api-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxx \
  --health-check-path /health \
  --region ap-southeast-1

# Create load balancer
aws elbv2 create-load-balancer \
  --name forecap-api-lb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx \
  --region ap-southeast-1

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:... \
  --region ap-southeast-1
```

## EC2 Deployment

### Step 1: Launch EC2 Instance

```bash
# Launch instance (recommended: t3.medium or larger)
aws ec2 run-instances \
  --image-id ami-xxx \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxx \
  --subnet-id subnet-xxx \
  --user-data file://ec2-user-data.sh
```

### Step 2: Install Docker on EC2

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 3: Deploy Application

```bash
# Clone repository
git clone your-repo
cd forecap-2025/backend

# Create .env file
cat > .env << EOF
MYSQL_HOST=your-rds-endpoint.amazonaws.com
MYSQL_DATABASE=forecap_db
MYSQL_USER=admin
MYSQL_PASSWORD=your-password
REDIS_HOST=your-elasticache-endpoint.cache.amazonaws.com
REDIS_PORT=6379
NODE_ENV=production
PORT=3000
EOF

# Build and run
docker-compose up -d
```

### Step 4: Set Up Auto-Scaling

```bash
# Create launch template
aws ec2 create-launch-template \
  --launch-template-name forecap-api-template \
  --launch-template-data file://launch-template.json

# Create auto-scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name forecap-api-asg \
  --launch-template LaunchTemplateName=forecap-api-template \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --vpc-zone-identifier "subnet-xxx,subnet-yyy"
```

## Performance Tuning

### Database Connection Pool

```typescript
// database.service.ts
connectionLimit: 20  // Adjust based on instance size
```

### Redis Configuration

```yaml
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

### Application Settings

```env
# .env
MYSQL_CONNECTION_LIMIT=20
NODE_ENV=production
PORT=3000
```

## Monitoring

### CloudWatch Metrics

- **CPU Utilization**: Target < 70%
- **Memory Usage**: Target < 80%
- **Request Count**: Monitor RPS
- **Error Rate**: Target < 1%
- **Response Time**: Target < 200ms (p95)

### Logs

```bash
# View ECS logs
aws logs tail /ecs/forecap-api --follow

# View EC2 logs
docker logs forecap-api --follow
```

## Cost Estimation

### ECS Fargate (2 tasks, 1 vCPU, 2GB RAM each)

- **Compute**: ~$60/month per task = **$120/month**
- **ALB**: ~$20/month
- **RDS MySQL**: db.r5.large = **$200/month**
- **ElastiCache Redis**: cache.r6g.large = **$150/month**
- **Total**: **~$490/month**

### EC2 (2x t3.medium)

- **EC2**: ~$60/month per instance = **$120/month**
- **ALB**: ~$20/month
- **RDS MySQL**: db.r5.large = **$200/month**
- **ElastiCache Redis**: cache.r6g.large = **$150/month**
- **Total**: **~$490/month**

## Scaling Strategy

### Horizontal Scaling

1. **ECS Fargate**: Increase `desired-count`
2. **EC2**: Add more instances to auto-scaling group
3. **Load Balancer**: Distributes traffic automatically

### Vertical Scaling

1. **Increase task size**: 1 vCPU → 2 vCPU
2. **Increase memory**: 2GB → 4GB
3. **Upgrade instance**: t3.medium → t3.large

## Security

### Best Practices

1. **Secrets Management**: Use AWS Secrets Manager
2. **VPC**: Deploy in private subnets
3. **Security Groups**: Restrict access to MySQL/Redis
4. **HTTPS**: Use ALB with SSL certificate
5. **IAM Roles**: Use least privilege

### Example Security Group

```json
{
  "Inbound": [
    {
      "Port": 3000,
      "Source": "ALB Security Group",
      "Protocol": "TCP"
    }
  ],
  "Outbound": [
    {
      "Port": 3306,
      "Destination": "RDS Security Group",
      "Protocol": "TCP"
    },
    {
      "Port": 6379,
      "Destination": "ElastiCache Security Group",
      "Protocol": "TCP"
    }
  ]
}
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs forecap-api

# Check health
curl http://localhost:3000/health
```

### High Memory Usage

- Increase container memory
- Check for memory leaks
- Optimize batch sizes

### Slow Queries

- Check database indexes
- Monitor connection pool
- Check Redis hit rate

## Backup & Recovery

### Database Backup

```bash
# Automated RDS backups (enabled by default)
# Manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier forecap-db \
  --db-snapshot-identifier forecap-snapshot-$(date +%Y%m%d)
```

### Application Backup

- Docker images stored in ECR
- Configuration in version control
- Environment variables in Secrets Manager

