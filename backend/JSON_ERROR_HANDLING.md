# JSON Error Handling - Implementation Guide

## Overview

This document describes the JSON error handling strategy implemented in the NestJS backend to ensure robust data parsing and comprehensive error logging.

## Error Handling Strategy

### Default Values for JSON Parse Errors

When JSON parsing fails, the system returns appropriate defaults based on the expected data type:

| Field | Expected Type | Default on Error | Location |
|-------|--------------|------------------|----------|
| `listCircularImages` | Array of strings | `[]` | `database.service.ts` |
| `listProductFavorite` | Array of objects | `[]` | `database.service.ts` |
| `listFavoriteStore` | Array of objects | `[]` | `database.service.ts` |
| Cached data | Object | `null` (cache deleted) | `redis.service.ts` |

### Rationale

1. **Empty Arrays for Lists**: Prevents frontend errors when iterating over arrays
2. **Empty Objects for Objects**: Prevents property access errors (if needed in future)
3. **Never Return `null` for Arrays**: Ensures consistent data structure

## Implementation Details

### Database Service (`database.service.ts`)

```typescript
// Example: listProductFavorite parsing
if (userData.listProductFavorite) {
  try {
    userData.listProductFavorite =
      typeof userData.listProductFavorite === 'string'
        ? JSON.parse(userData.listProductFavorite)
        : userData.listProductFavorite;
  } catch (error) {
    // Log detailed error
    this.logger.logError(error, {
      userId,
      operation: 'json_parse',
      field: 'listProductFavorite',
      fieldType: 'array',
      rawValue: userData.listProductFavorite.substring(0, 200),
      defaultValue: '[]',
    });
    // Return empty array instead of null
    userData.listProductFavorite = [];
  }
}
```

### Redis Service (`redis.service.ts`)

```typescript
// Example: Cache data parsing
try {
  const parsed = JSON.parse(cached);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Parsed cache data is not an object');
  }
  return parsed;
} catch (error) {
  // Log detailed error with raw value preview
  this.logger.logError(error, {
    userId,
    operation: 'cache_json_parse',
    key,
    rawValuePreview: cached.substring(0, 500),
    rawValueLength: cached.length,
  });
  // Delete invalid cache entry
  await this.del(key);
  return null;
}
```

## Enhanced Error Logging

### Log Structure

All JSON parse errors include:

```typescript
{
  // Standard fields
  timestamp: string;
  level: 'ERROR';
  context: string; // Service name
  message: string; // Error message
  
  // Request context
  userId: number;
  requestId?: string;
  operation: string; // e.g., 'json_parse', 'cache_json_parse'
  
  // Field information
  field?: string; // Field name (e.g., 'listProductFavorite')
  fieldType?: string; // Expected type (e.g., 'array', 'object')
  rawValue?: string; // Preview of raw value (truncated)
  rawValueLength?: number; // Full length of raw value
  rawValuePreview?: string; // Truncated preview (500 chars)
  defaultValue?: string; // Default value used (e.g., '[]')
  
  // Error details
  errorType: string; // Error constructor name
  errorMessage: string; // Error message
  errorStack?: string; // Stack trace
  
  // Additional context
  key?: string; // Cache key (for Redis errors)
  cacheKey?: string; // Cache key (alternative)
  stage?: string; // Operation stage
  duration?: number; // Operation duration
}
```

### Example Error Logs

#### Database JSON Parse Error
```json
{
  "timestamp": "2025-11-20T10:00:00.000Z",
  "level": "ERROR",
  "context": "DatabaseService",
  "message": "Unexpected token } in JSON at position 42",
  "userId": 12345,
  "operation": "json_parse",
  "field": "listProductFavorite",
  "fieldType": "array",
  "rawValue": "{\"id\":1,\"name\":\"Product\"}...",
  "defaultValue": "[]",
  "errorType": "SyntaxError",
  "errorMessage": "Unexpected token } in JSON at position 42"
}
```

#### Redis Cache Parse Error
```json
{
  "timestamp": "2025-11-20T10:00:00.000Z",
  "level": "ERROR",
  "context": "RedisService",
  "message": "Unexpected end of JSON input",
  "userId": 12345,
  "operation": "cache_json_parse",
  "key": "user:recap:12345",
  "rawValueLength": 150,
  "rawValuePreview": "{\"userName\":\"John\",\"trxCount\":100...",
  "errorType": "SyntaxError",
  "errorMessage": "Unexpected end of JSON input"
}
```

## Querying Error Logs

### Find All JSON Parse Errors
```bash
docker compose logs api | grep '"operation":"json_parse"'
```

### Find Errors for Specific Field
```bash
docker compose logs api | grep '"field":"listProductFavorite"'
```

### Find Cache Parse Errors
```bash
docker compose logs api | grep '"operation":"cache_json_parse"'
```

### Count Errors by Field
```bash
docker compose logs api | grep '"operation":"json_parse"' | \
  jq -r '.field' | sort | uniq -c | sort -rn
```

### Find Errors with Raw Values
```bash
docker compose logs api | grep '"operation":"json_parse"' | \
  jq -r 'select(.rawValue != null) | {field, rawValue, errorMessage}'
```

## Best Practices

1. **Always Log Before Defaulting**: Never silently fail - always log the error
2. **Include Raw Values**: Help debug by including raw value previews
3. **Use Appropriate Defaults**: Arrays → `[]`, Objects → `{}`, never `null` for arrays
4. **Validate Parsed Data**: Check that parsed data matches expected type
5. **Clean Up Invalid Cache**: Delete invalid cache entries to prevent repeated errors

## Testing

### Test JSON Parse Error Handling

```typescript
// Simulate invalid JSON in database
await connection.execute(
  'UPDATE user_recap_data SET list_product_favorite = ? WHERE user_id = ?',
  ['invalid json', 12345]
);

// Request should return empty array, not null
const result = await userService.getUserRecap(12345);
expect(result.listProductFavorite).toEqual([]); // Not null!
```

### Test Cache Parse Error Handling

```typescript
// Set invalid JSON in cache
await redis.set('user:recap:12345', 'invalid json', 300);

// Request should delete cache and fetch from DB
const result = await userService.getUserRecap(12345);
// Cache should be deleted, data fetched from DB
```

## Monitoring

### Metrics to Track

1. **JSON Parse Error Rate**: Count of JSON parse errors per field
2. **Cache Parse Error Rate**: Count of cache parse errors
3. **Default Value Usage**: Track when defaults are used
4. **Raw Value Patterns**: Identify common invalid JSON patterns

### Alerts

Set up alerts for:
- JSON parse error rate > 0.1%
- Cache parse error rate > 0.5%
- Repeated errors for same field/user

---

**Last Updated:** November 20, 2025  
**Status:** ✅ Implemented and tested

