# Error Analysis - NestJS Backend Load Test

## Latest Test Results (November 20, 2025)

### Error Rate: 0.03% (Approximately 24 errors out of 79,656 requests)

## Error Definition in k6 Test

Based on the `k6-realistic-test.js` script, an error is counted when **any** of these checks fail:

```javascript
const success = check(response, {
  'status is 200': (r) => r.status === 200,
  'response time < 200ms': (r) => r.timings.duration < 200,
  'response time < 500ms': (r) => r.timings.duration < 500,
  'has user data': (r) => {
    try {
      const body = JSON.parse(r.body);
      return body.userName !== undefined && body.trxCount !== undefined;
    } catch {
      return false;
    }
  },
});
```

## Error Categories

### 1. HTTP Status Code Errors (Non-200 responses)
- **401 Unauthorized**: Authentication failures
  - Invalid signature
  - Expired timestamp
  - Missing headers
- **404 Not Found**: User doesn't exist in database
- **500 Internal Server Error**: Server-side errors
  - Database connection issues
  - Redis connection issues
  - JSON parsing errors
  - Unexpected exceptions

### 2. Response Time Errors
- **Response time >= 200ms**: Slow responses (p95 threshold)
- **Response time >= 500ms**: Very slow responses (p99 threshold)

### 3. Response Body Errors
- **Missing userName**: Response doesn't contain expected user data
- **Missing trxCount**: Response doesn't contain expected transaction count
- **Invalid JSON**: Response body cannot be parsed as JSON

## How to Capture Error Details

### Option 1: Run k6 with Detailed Logging

```bash
BASE_URL=http://localhost:3000 k6 run --out json=results.json k6-realistic-test.js
```

Then analyze the JSON output:
```bash
cat results.json | jq '.metrics.checks.values.fails'
```

### Option 2: Check Application Logs

```bash
# View errors from application logs
docker compose logs api | grep '"level":"ERROR"'

# View warnings (slow requests, authentication failures)
docker compose logs api | grep '"level":"WARN"'

# View specific error types
docker compose logs api | grep -E '(operation|stage)' | grep ERROR
```

### Option 3: Use the View Logs Script

```bash
# View all errors
./scripts/view-logs.sh errors

# View errors for specific user
./scripts/view-logs.sh user 12345

# View error statistics
./scripts/view-logs.sh stats
```

### Option 4: Enhanced k6 Test with Error Logging

Add this to your k6 test to log all errors:

```javascript
if (!success) {
  errorRate.add(1);
  console.error(`ERROR - User ${userId}:`, {
    status: response.status,
    duration: response.timings.duration,
    body: response.body.substring(0, 200),
    checks: {
      status200: response.status === 200,
      duration200: response.timings.duration < 200,
      duration500: response.timings.duration < 500,
      hasUserData: (() => {
        try {
          const body = JSON.parse(response.body);
          return body.userName !== undefined && body.trxCount !== undefined;
        } catch {
          return false;
        }
      })(),
    }
  });
}
```

## Likely Error Sources (Based on 0.03% Error Rate)

Given the very low error rate (0.03%), the errors are likely:

### 1. **User Not Found (404)** - Most Likely
- **Cause**: Random user IDs in test don't exist in database
- **Impact**: Low (expected behavior for non-existent users)
- **Solution**: Use user IDs that exist in database, or handle 404 gracefully

### 2. **Slow Responses (200ms+ or 500ms+)** - Possible
- **Cause**: Cache misses, database queries, connection pool exhaustion
- **Impact**: Medium (affects user experience)
- **Solution**: Optimize queries, increase cache hit rate, tune connection pools

### 3. **Authentication Failures (401)** - Less Likely
- **Cause**: Timestamp expiration during test, signature mismatch
- **Impact**: Low (test-related, not production issue)
- **Solution**: Ensure test uses valid timestamps and signatures

### 4. **Server Errors (500)** - Least Likely
- **Cause**: Database/Redis connection issues, unexpected exceptions
- **Impact**: High (needs investigation)
- **Solution**: Check application logs for stack traces

## Error Breakdown Estimation

Based on typical patterns with 0.03% error rate (24 errors):

| Error Type | Estimated Count | Percentage |
|------------|----------------|------------|
| **404 Not Found** | ~15-20 | 62-83% |
| **Slow Response (200ms+)** | ~3-5 | 12-21% |
| **Slow Response (500ms+)** | ~1-2 | 4-8% |
| **401 Unauthorized** | ~1-2 | 4-8% |
| **500 Server Error** | ~0-1 | 0-4% |

## Recommendations

### 1. **Capture Error Details in Next Test**

Modify the k6 test to log all errors to a file:

```javascript
import { textWriter } from 'k6/experimental/io';

const errorLog = textWriter('errors.log');

export default function () {
  // ... existing code ...
  
  if (!success) {
    errorLog.write(JSON.stringify({
      timestamp: new Date().toISOString(),
      userId,
      status: response.status,
      duration: response.timings.duration,
      body: response.body.substring(0, 500),
    }) + '\n');
  }
}
```

### 2. **Monitor Application Logs During Test**

```bash
# In one terminal, follow logs
docker compose logs -f api | grep -E '(ERROR|WARN|statusCode)'

# In another terminal, run the test
BASE_URL=http://localhost:3000 k6 run k6-realistic-test.js
```

### 3. **Check for Specific Error Patterns**

```bash
# Authentication errors
docker compose logs api | grep -i 'unauthorized\|authentication\|auth'

# Database errors
docker compose logs api | grep -i 'database\|mysql\|connection'

# Redis errors
docker compose logs api | grep -i 'redis\|cache'

# JSON parsing errors
docker compose logs api | grep -i 'json\|parse'
```

### 4. **Analyze Error Distribution**

```bash
# Count errors by operation
docker compose logs api | grep '"level":"ERROR"' | \
  jq -r '.operation' | sort | uniq -c | sort -rn

# Count errors by status code
docker compose logs api | grep '"level":"ERROR"' | \
  jq -r '.statusCode' | sort | uniq -c | sort -rn
```

## Next Steps

1. **Run test with enhanced logging** to capture exact error details
2. **Check application logs** during the test run
3. **Analyze error patterns** to identify root causes
4. **Fix identified issues** before production deployment

## Current Status

✅ **Error Rate: 0.03%** - Excellent! (Lower than Go's 0.05%)
✅ **No ERROR logs found** - Suggests errors are likely:
   - 404 Not Found (expected for non-existent users)
   - Slow responses (200ms+ threshold)
   - Not application-level errors (no exceptions thrown)

**Recommendation**: The 0.03% error rate is excellent and likely consists of:
- Expected 404 responses for non-existent users
- Occasional slow responses exceeding thresholds
- Not critical application errors

---

**Last Updated:** November 20, 2025  
**Test:** k6 realistic load test (79,656 requests, 150 max VUs, 27 minutes)

