# Error Logging Guide

## Overview

Comprehensive error logging has been added to the NestJS backend to help identify and debug the 0.19% error rate. All errors are now logged with structured context.

## Log Format

Errors are logged as JSON for easy parsing and analysis:

```json
{
  "timestamp": "2025-11-19T23:44:29.123Z",
  "level": "ERROR",
  "context": "UserService",
  "message": "Database query failed",
  "stack": "Error: ...",
  "userId": 12345,
  "requestId": "req_1234567890_abc123",
  "operation": "get_user_recap",
  "duration": 150,
  "query": "SELECT * FROM user_recap_data WHERE user_id = ?"
}
```

## Logged Errors

### 1. Authentication Errors
- **Location:** `UserController`
- **Logged when:** Invalid headers, expired timestamps, invalid signatures
- **Context:** userId, requestId, error type, headers

### 2. Database Errors
- **Location:** `DatabaseService`
- **Logged when:** Query failures, connection errors, slow queries (>100ms)
- **Context:** userId, query, duration, error type

### 3. Redis Errors
- **Location:** `RedisService`
- **Logged when:** Connection failures, operation errors, JSON parse errors
- **Context:** userId, operation, key, error type

### 4. Service Errors
- **Location:** `UserService`
- **Logged when:** Service failures, cache errors, database errors
- **Context:** userId, requestId, operation, stage, duration

### 5. HTTP Errors
- **Location:** `LoggingInterceptor`, `AllExceptionsFilter`
- **Logged when:** 4xx/5xx responses, unhandled exceptions
- **Context:** userId, requestId, method, path, statusCode, duration

## Log Levels

### ERROR
- Database query failures
- Redis connection errors
- Service exceptions
- HTTP 5xx errors
- Unhandled exceptions

### WARN
- Authentication failures (401)
- Slow requests (>1s)
- Slow database queries (>100ms)
- Cache operation failures
- JSON parse errors

## Viewing Logs

### Development
```bash
# Logs appear in console
npm run start:dev
```

### Production
```bash
# Logs appear in stdout/stderr
# Can be captured by logging service (CloudWatch, Datadog, etc.)
npm run start:prod
```

### Docker
```bash
# View logs
docker compose logs -f api

# Filter errors only
docker compose logs api | grep ERROR
```

## Analyzing Errors

### Find All Errors
```bash
# In logs, search for:
grep '"level":"ERROR"' logs/app.log
```

### Group by Error Type
```bash
# Count errors by operation
grep '"level":"ERROR"' logs/app.log | jq -r '.operation' | sort | uniq -c
```

### Find Errors for Specific User
```bash
grep '"userId":12345' logs/app.log | grep ERROR
```

### Find Slow Requests
```bash
grep '"level":"WARN"' logs/app.log | grep '"duration"' | jq 'select(.duration > 1000)'
```

## Common Error Patterns

### 1. Database Connection Errors
```json
{
  "operation": "get_user_recap",
  "errorType": "Error",
  "message": "Connection lost: The server closed the connection"
}
```
**Action:** Check MySQL connection pool, network connectivity

### 2. Redis Connection Errors
```json
{
  "operation": "redis_get",
  "errorType": "Error",
  "message": "Connection to Redis failed"
}
```
**Action:** Check Redis connection, network connectivity

### 3. JSON Parse Errors
```json
{
  "operation": "json_parse",
  "field": "listCircularImages",
  "message": "Unexpected token in JSON"
}
```
**Action:** Check data integrity in MySQL JSON columns

### 4. Authentication Errors
```json
{
  "operation": "auth_validation",
  "error": "Expired. Request is 11.23 minutes old (Max: 10m)"
}
```
**Action:** Check client clock synchronization

### 5. Slow Queries
```json
{
  "operation": "get_user_recap",
  "queryDuration": 250,
  "level": "WARN"
}
```
**Action:** Optimize database queries, check indexes

## Log Aggregation

### Recommended Setup

1. **Local Development:**
   - Logs to console (stdout)
   - Use `jq` for JSON parsing

2. **Production:**
   - Send logs to CloudWatch (AWS)
   - Or Datadog, New Relic, etc.
   - Use log aggregation tools

3. **Docker:**
   - Logs to stdout/stderr
   - Docker logging driver captures logs
   - Can forward to external service

## Monitoring Errors

### Key Metrics to Track

1. **Error Rate by Type:**
   - Database errors
   - Redis errors
   - Authentication errors
   - JSON parse errors

2. **Error Rate by User:**
   - Identify problematic users
   - Check for data issues

3. **Error Rate by Endpoint:**
   - Identify problematic endpoints
   - Check for code issues

4. **Slow Requests:**
   - Requests >1s
   - Database queries >100ms

## Example Error Analysis

```bash
# Count errors by type
cat logs/app.log | jq -r 'select(.level=="ERROR") | .operation' | sort | uniq -c

# Find most common errors
cat logs/app.log | jq -r 'select(.level=="ERROR") | .message' | sort | uniq -c | sort -rn

# Find errors for specific time range
cat logs/app.log | jq 'select(.timestamp > "2025-11-19T23:00:00Z" and .timestamp < "2025-11-19T24:00:00Z" and .level=="ERROR")'
```

## Best Practices

1. **Always include context:**
   - userId
   - requestId
   - operation
   - duration

2. **Log at appropriate level:**
   - ERROR: Failures that need attention
   - WARN: Issues that should be monitored
   - INFO: Normal operations (optional)

3. **Don't log sensitive data:**
   - Passwords
   - Full request bodies
   - Personal information

4. **Use structured logging:**
   - JSON format
   - Consistent fields
   - Easy to parse

---

**Last Updated:** November 2025  
**Purpose:** Identify and debug the 0.19% error rate

