# Data Import Guide

This guide explains how to import Excel data (from BigQuery) into MySQL database.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Import Script](#import-script)
4. [Manual Import](#manual-import)
5. [Troubleshooting](#troubleshooting)

---

## Overview

The import script (`backend/src/scripts/import-excel.ts`) reads Excel files and imports data into MySQL using a lean single-table design with JSON columns.

### Data Flow

```
Excel File (BigQuery Export)
    ↓
NestJS Import Script
    ↓
Parse & Transform
    ↓
Batch Insert to MySQL (10K rows/batch)
    ↓
Cache in Redis (optional)
```

### Database Schema

Data is stored in a single table `user_recap_data` with:
- Regular columns for scalar values (user_id, user_name, trx_count, etc.)
- JSON columns for arrays (list_product_favorite, list_favorite_store, list_circular_images)

---

## Prerequisites

### Required

- Node.js 20+
- MySQL 8.0+ (with schema created)
- Excel file with user data

### Optional

- Redis (for caching during import)

### Excel File Format

Expected columns in Excel file:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| user_id | Number | Yes | Unique user identifier |
| user_name | String | Yes | User's name |
| trx_count | Number | Yes | Transaction count |
| variant_count | Number | No | Number of product variants |
| total_point | Number | No | Total points accumulated |
| total_point_description | String | No | Points description |
| total_point_possible_redeem | Number | No | Redeemable items count |
| total_point_image | String | No | Points image URL |
| delivery_count | Number | No | Delivery transactions |
| pickup_count | Number | No | Pickup transactions |
| cheaper_subs_desc | String | No | Subscription savings description |
| cheaper_subs_amount | Number | No | Subscription savings amount |
| top_ranking | Number | No | User's top ranking |
| list_circular_images | JSON String | No | Array of image URLs |
| listProductFavorite | JSON String | No | Array of favorite products |
| listFavoriteStore | JSON String | No | Array of favorite stores |

### JSON Format Examples

**listProductFavorite:**
```json
[
  {
    "productName": "Espresso",
    "countCups": 25,
    "productImage": "https://example.com/espresso.jpg"
  },
  {
    "productName": "Cappuccino",
    "countCups": 18,
    "productImage": "https://example.com/cappuccino.jpg"
  }
]
```

**listFavoriteStore:**
```json
[
  {
    "storeName": "Fore Coffee Grand Indonesia",
    "transactionCount": 30,
    "storeImage": "https://example.com/store1.jpg"
  }
]
```

---

## Import Script

### Basic Usage

```bash
cd backend
npm install
npm run import:excel ../results/forecap_2025_prototype.xlsx
```

### Script Options

The script processes data in batches of **10,000 rows** by default. You can modify `BATCH_SIZE` in `src/scripts/import-excel.ts`:

```typescript
const BATCH_SIZE = 10000; // Adjust based on available memory
```

### What the Script Does

1. **Reads Excel file** using `xlsx` library
2. **Validates data** and parses JSON fields
3. **Processes in batches** to avoid memory issues
4. **Inserts to MySQL** using transactions
5. **Handles errors** gracefully and continues
6. **Reports progress** with success/error counts

### Output Example

```
Reading Excel file: ../results/forecap_2025_prototype.xlsx
✓ Loaded 15840 rows

Processing 15840 rows in batches of 10000...

Batch 1/2 (1-10000)
  ✓ Batch completed: 10000 success, 0 errors

Batch 2/2 (10001-15840)
  ✓ Batch completed: 5840 success, 0 errors

============================================================
Import completed!
  Total rows: 15840
  Success: 15840
  Errors: 0
  Time elapsed: 45.23s
  Rate: 350.12 rows/second
============================================================
```

---

## Manual Import

### Using MySQL LOAD DATA

If you have CSV format, you can use MySQL's native import:

```sql
-- Convert Excel to CSV first
-- Then use LOAD DATA

LOAD DATA LOCAL INFILE '/path/to/user_data.csv'
INTO TABLE user_recap_data
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(user_id, user_name, trx_count, ...);
```

**Note**: JSON columns need special handling with LOAD DATA.

### Using Python Script (Alternative)

If you prefer Python, use the original script:

```bash
cd scripts
pip install pandas mysql-connector-python openpyxl
python import-excel-to-mysql.py ../results/forecap_2025_prototype.xlsx
```

---

## Import from Different Sources

### From BigQuery

```bash
# Export from BigQuery to CSV
bq extract --destination_format=CSV \
  'project:dataset.table' \
  gs://bucket/export.csv

# Download and convert to Excel (if needed)
# Then use import script
```

### From PostgreSQL

```bash
# Export to CSV
psql -d database -c "COPY (SELECT * FROM users) TO '/tmp/users.csv' CSV HEADER;"

# Convert to Excel (using Python pandas)
python -c "import pandas as pd; pd.read_csv('/tmp/users.csv').to_excel('users.xlsx', index=False)"

# Import
npm run import:excel users.xlsx
```

### From API

```bash
# Fetch data from API and save to Excel
curl https://api.example.com/users | \
  jq -r '.[] | [.id, .name, .trx_count] | @csv' > users.csv

# Convert to Excel and import
```

---

## Performance Optimization

### Batch Size Tuning

Adjust batch size based on:
- **Available memory**: Larger batches = more memory
- **Network latency**: Larger batches = fewer round trips
- **Error recovery**: Smaller batches = easier to retry

```typescript
// For high-memory systems
const BATCH_SIZE = 50000;

// For low-memory systems
const BATCH_SIZE = 5000;
```

### Connection Pool Tuning

Increase MySQL connection limit for faster imports:

```sql
SET GLOBAL max_connections = 200;
```

Update `.env`:
```env
MYSQL_CONNECTION_LIMIT=50
```

### Disable Indexes During Import

For very large imports, temporarily disable indexes:

```sql
-- Disable indexes
ALTER TABLE user_recap_data DISABLE KEYS;

-- Import data
-- (run import script)

-- Re-enable indexes
ALTER TABLE user_recap_data ENABLE KEYS;
```

---

## Verification

### Check Imported Data

```sql
-- Count total records
SELECT COUNT(*) FROM user_recap_data;

-- Check sample data
SELECT user_id, user_name, trx_count 
FROM user_recap_data 
LIMIT 10;

-- Check JSON columns
SELECT 
  user_id,
  JSON_LENGTH(list_product_favorite) as product_count,
  JSON_LENGTH(list_favorite_store) as store_count
FROM user_recap_data
WHERE list_product_favorite IS NOT NULL
LIMIT 10;

-- Verify specific user
SELECT * FROM user_recap_data WHERE user_id = 12345;
```

### Test API Endpoint

```bash
# Generate auth headers
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
USER_ID=12345
SIGN=$(echo -n "${TIMESTAMP}forecap2025${USER_ID}" | base64)

# Test API
curl -H "timestamp: ${TIMESTAMP}" \
     -H "user_id: ${USER_ID}" \
     -H "sign: ${SIGN}" \
     http://localhost:3000/api/user-data
```

---

## Troubleshooting

### Common Errors

#### 1. "Cannot connect to MySQL"

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution:**
- Verify MySQL is running: `mysql -u root -p`
- Check connection settings in `.env`
- Verify network connectivity

#### 2. "Duplicate entry for key 'PRIMARY'"

**Error:**
```
Error: Duplicate entry '12345' for key 'PRIMARY'
```

**Solution:**
- Data already exists (script uses `ON DUPLICATE KEY UPDATE`)
- This is normal - existing records will be updated
- To start fresh: `TRUNCATE TABLE user_recap_data;`

#### 3. "Invalid JSON format"

**Error:**
```
Error: Unexpected token in JSON at position X
```

**Solution:**
- Check JSON format in Excel file
- Validate JSON using online validator
- Fix malformed JSON before importing

#### 4. "Out of memory"

**Error:**
```
Error: JavaScript heap out of memory
```

**Solution:**
- Reduce `BATCH_SIZE` in import script
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run import:excel ...`
- Process in smaller chunks

#### 5. "Excel file not found"

**Error:**
```
Error: ENOENT: no such file or directory
```

**Solution:**
- Verify file path is correct
- Use absolute path if relative path doesn't work
- Check file permissions

### Performance Issues

#### Slow Import Speed

**Symptoms:** < 100 rows/second

**Solutions:**
1. Increase batch size
2. Disable indexes during import
3. Use MySQL `LOAD DATA` for CSV
4. Check network latency to database
5. Increase MySQL connection pool

#### High Memory Usage

**Symptoms:** Process uses > 2GB RAM

**Solutions:**
1. Reduce batch size
2. Process in chunks
3. Use streaming for large files
4. Increase available memory

### Data Validation

#### Verify Data Integrity

```sql
-- Check for NULL user_ids
SELECT COUNT(*) FROM user_recap_data WHERE user_id IS NULL;

-- Check for duplicate user_ids
SELECT user_id, COUNT(*) as cnt 
FROM user_recap_data 
GROUP BY user_id 
HAVING cnt > 1;

-- Check JSON validity
SELECT user_id 
FROM user_recap_data 
WHERE list_product_favorite IS NOT NULL 
  AND JSON_VALID(list_product_favorite) = 0;
```

---

## Best Practices

1. **Backup before import**: Always backup existing data
2. **Test with sample**: Import small sample first (100 rows)
3. **Monitor progress**: Watch logs for errors
4. **Validate data**: Check data integrity after import
5. **Index after import**: Rebuild indexes if disabled
6. **Cache warming**: Optionally warm Redis cache after import

---

## Next Steps

- [Deployment Guide](./deployment-guide.md)
- [Load Testing Guide](./load-testing-guide.md)
- [Performance Tuning](./performance-tuning.md)

