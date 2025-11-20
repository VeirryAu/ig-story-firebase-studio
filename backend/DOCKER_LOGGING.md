# Docker Logging Guide

## Overview

The NestJS backend logs to **stdout/stderr** (console), which is the Docker best practice. Docker automatically captures these logs.

## Viewing Logs

### 1. View Real-time Logs (Follow Mode)

```bash
# View all logs from the API container
docker compose logs -f api

# View logs from all services
docker compose logs -f

# View last 100 lines
docker compose logs --tail=100 api
```

### 2. View Historical Logs

```bash
# View all logs
docker compose logs api

# View logs with timestamps
docker compose logs -t api

# View logs from specific time
docker compose logs --since 30m api
docker compose logs --since 2025-11-19T10:00:00 api
```

### 3. Filter Logs

```bash
# Filter errors only
docker compose logs api | grep ERROR

# Filter by user ID
docker compose logs api | grep '"userId":12345'

# Filter by operation
docker compose logs api | grep '"operation":"database_query"'

# Use jq for JSON parsing (if installed)
docker compose logs api | jq 'select(.level=="ERROR")'
```

### 4. Export Logs to File

```bash
# Export all logs
docker compose logs api > api.log

# Export errors only
docker compose logs api | grep ERROR > errors.log

# Export with timestamps
docker compose logs -t api > api-with-timestamps.log
```

## Docker Compose Logging Configuration

### Current Setup (Default)

The current `docker-compose.yml` uses Docker's default logging driver, which stores logs in:
- **Location:** `/var/lib/docker/containers/<container-id>/<container-id>-json.log`
- **Rotation:** Managed by Docker daemon
- **Size Limit:** Default (usually 10MB per container)

### Configure Log Rotation

Add logging configuration to `docker-compose.yml`:

```yaml
services:
  api:
    # ... other config ...
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=forecap-api"
```

This will:
- Rotate logs when they reach 10MB
- Keep 3 rotated files (30MB total)
- Add service label for filtering

### View Log File Location

```bash
# Find container ID
docker ps | grep api

# Find log file location
docker inspect <container-id> | grep LogPath

# View log file directly (requires root/sudo)
sudo cat $(docker inspect --format='{{.LogPath}}' <container-id>)
```

## Production Logging Options

### Option 1: Docker Logging Driver (Recommended for Simple Setup)

Configure in `docker-compose.production.yml`:

```yaml
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "5"
        compress: "true"
```

### Option 2: Volume Mount for Log Files

Mount a volume to persist logs:

```yaml
services:
  api:
    volumes:
      - ./logs:/app/logs
    environment:
      - LOG_FILE_PATH=/app/logs/app.log
```

Then modify the logger to write to file (see below).

### Option 3: External Log Aggregation

#### AWS CloudWatch

```yaml
services:
  api:
    logging:
      driver: "awslogs"
      options:
        awslogs-group: "/ecs/forecap-api"
        awslogs-region: "us-east-1"
        awslogs-stream-prefix: "api"
```

#### Datadog

```yaml
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    labels:
      - "com.datadoghq.ad.logs"='[{"source": "nodejs", "service": "forecap-api"}]'
```

#### ELK Stack (Elasticsearch, Logstash, Kibana)

```yaml
services:
  api:
    logging:
      driver: "gelf"
      options:
        gelf-address: "udp://logstash:12201"
        tag: "forecap-api"
```

## Accessing Logs in Different Environments

### Local Development (Docker Compose)

```bash
# From project root
cd backend
docker compose logs -f api
```

### EC2 Deployment

```bash
# SSH into EC2 instance
ssh user@ec2-instance

# View logs
docker compose -f docker-compose.production.yml logs -f api

# Or if using systemd
sudo journalctl -u forecap-api -f
```

### ECS Fargate Deployment

Logs are automatically sent to CloudWatch Logs:

1. **AWS Console:**
   - Go to CloudWatch → Logs → Log groups
   - Find `/ecs/forecap-api` log group
   - View streams

2. **AWS CLI:**
   ```bash
   # List log groups
   aws logs describe-log-groups --log-group-name-prefix /ecs/forecap-api
   
   # View logs
   aws logs tail /ecs/forecap-api --follow
   
   # Filter errors
   aws logs filter-log-events \
     --log-group-name /ecs/forecap-api \
     --filter-pattern "ERROR"
   ```

## Log Analysis Commands

### Count Errors by Type

```bash
docker compose logs api | grep '"level":"ERROR"' | \
  jq -r '.operation' | sort | uniq -c
```

### Find Most Common Errors

```bash
docker compose logs api | grep '"level":"ERROR"' | \
  jq -r '.message' | sort | uniq -c | sort -rn | head -10
```

### Find Errors for Specific User

```bash
docker compose logs api | grep '"userId":12345' | grep ERROR
```

### Find Slow Requests

```bash
docker compose logs api | grep '"level":"WARN"' | \
  jq 'select(.duration > 1000)'
```

### Time Range Analysis

```bash
# Errors in last hour
docker compose logs --since 1h api | grep ERROR

# Errors between timestamps
docker compose logs --since 2025-11-19T10:00:00 \
  --until 2025-11-19T11:00:00 api | grep ERROR
```

## File-Based Logging (Optional)

If you need file-based logging instead of stdout:

### 1. Install Winston (File Logger)

```bash
npm install winston winston-daily-rotate-file
```

### 2. Update Logger Service

Modify `src/common/logger.service.ts` to write to both console and file:

```typescript
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class AppLogger implements LoggerService {
  private logger: winston.Logger;
  
  constructor() {
    this.logger = winston.createLogger({
      format: winston.format.json(),
      transports: [
        // Console output
        new winston.transports.Console(),
        // File output
        new DailyRotateFile({
          filename: 'logs/app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
        }),
        // Error file
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '30d',
        }),
      ],
    });
  }
  
  // ... rest of implementation
}
```

### 3. Mount Log Directory

```yaml
services:
  api:
    volumes:
      - ./logs:/app/logs
```

### 4. Access Log Files

```bash
# View current log
docker compose exec api cat /app/logs/app-2025-11-19.log

# View error log
docker compose exec api cat /app/logs/error-2025-11-19.log

# Copy logs to host
docker compose cp api:/app/logs ./logs
```

## Best Practices

1. **Use stdout/stderr** (current setup) - Docker handles rotation and aggregation
2. **Configure log rotation** - Prevent disk space issues
3. **Use structured logging** - JSON format for easy parsing
4. **Add request IDs** - For tracing requests across services
5. **Set appropriate log levels** - ERROR, WARN, INFO, DEBUG
6. **Don't log sensitive data** - Passwords, tokens, PII
7. **Use log aggregation in production** - CloudWatch, Datadog, ELK

## Quick Reference

```bash
# Most common commands
docker compose logs -f api                    # Follow logs
docker compose logs --tail=100 api            # Last 100 lines
docker compose logs --since 1h api            # Last hour
docker compose logs api | grep ERROR           # Errors only
docker compose logs api > api.log             # Export to file
docker compose exec api ls -la /app/logs      # List log files (if file logging)
```

---

**Last Updated:** November 2025  
**Current Setup:** stdout/stderr (Docker default)  
**Recommended for Production:** CloudWatch Logs (AWS) or similar aggregation service

