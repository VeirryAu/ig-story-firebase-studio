# Database Setup and Import Scripts

## Overview

These scripts help you:
1. Set up MySQL database schema
2. Import Excel data (from BigQuery) to MySQL
3. Configure Redis caching

## Prerequisites

- Python 3.8+ with packages: `pandas`, `mysql-connector-python`, `redis`, `openpyxl`
- MySQL 8.0+ server
- Redis 6.0+ server
- Node.js dependencies: `mysql2`, `ioredis`

## Installation

### Python Dependencies

```bash
pip install pandas mysql-connector-python redis openpyxl
```

### Node.js Dependencies

```bash
npm install mysql2 ioredis
```

## Setup Steps

### 1. Create MySQL Database Schema

```bash
mysql -u root -p < scripts/setup-mysql-schema.sql
```

Or connect to MySQL and run the SQL file manually.

### 2. Configure Environment Variables

Create a `.env` file or set environment variables:

```bash
# MySQL Configuration
export MYSQL_HOST=localhost
export MYSQL_DATABASE=forecap_db
export MYSQL_USER=root
export MYSQL_PASSWORD=your_password

# Redis Configuration
export REDIS_HOST=localhost
export REDIS_PORT=6379
export REDIS_PASSWORD=
```

### 3. Import Excel Data

```bash
python scripts/import-excel-to-mysql.py results/forecap_2025_prototype.xlsx
```

The script will:
- Read the Excel file
- Process data in batches of 10,000 rows
- Insert into MySQL with transactions
- Cache data in Redis (optional)

### 4. Verify Import

```sql
-- Check total records
SELECT COUNT(*) FROM user_recap_data;

-- Check sample data
SELECT * FROM user_recap_data LIMIT 5;

-- Check favorite products
SELECT COUNT(*) FROM user_favorite_products;

-- Check favorite stores
SELECT COUNT(*) FROM user_favorite_stores;
```

## Performance Tips

1. **Batch Size**: Adjust `BATCH_SIZE` in the Python script (default: 10,000)
2. **Connection Pool**: Adjust `pool_size` based on your MySQL configuration
3. **Redis**: Ensure Redis has enough memory (2GB+ recommended)
4. **Indexes**: The schema includes indexes on `user_id` for fast lookups

## Troubleshooting

### Import Errors

- **Connection errors**: Check MySQL is running and credentials are correct
- **Memory errors**: Reduce `BATCH_SIZE` or increase MySQL `max_allowed_packet`
- **Duplicate key errors**: Data already exists, script uses `ON DUPLICATE KEY UPDATE`

### Redis Errors

- Redis connection failures are non-fatal (script continues without cache)
- Check Redis is running: `redis-cli ping`

## Next Steps

After importing data:

1. Update your Next.js API route to use `getUserRecap()` from `src/lib/database.ts`
2. Test with a sample user_id
3. Monitor Redis cache hit rate
4. Set up database backups
5. Configure monitoring and alerting

