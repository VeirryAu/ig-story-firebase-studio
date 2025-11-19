/**
 * Import Excel file to MySQL database (Lean single-table design)
 * Usage: npm run import:excel <path-to-excel-file>
 */

import * as XLSX from 'xlsx';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../database/redis.service';

interface ExcelRow {
  user_id: number;
  user_name: string;
  trx_count: number;
  variant_count?: number;
  total_point?: number;
  total_point_description?: string;
  total_point_possible_redeem?: number;
  total_point_image?: string;
  delivery_count?: number;
  pickup_count?: number;
  cheaper_subs_desc?: string;
  cheaper_subs_amount?: number;
  top_ranking?: number;
  list_circular_images?: string;
  listProductFavorite?: string;
  listFavoriteStore?: string;
}

const BATCH_SIZE = 10000;

function parseJsonField(value: any): any {
  if (!value || value === '') return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}

async function processBatch(
  databaseService: DatabaseService,
  redisService: RedisService,
  batch: ExcelRow[],
): Promise<{ success: number; errors: number }> {
  let success = 0;
  let errors = 0;

  for (const row of batch) {
    try {
      const userId = parseInt(row.user_id as any);

      // Parse JSON fields
      const products = parseJsonField(row.listProductFavorite);
      const stores = parseJsonField(row.listFavoriteStore);
      const circularImages = parseJsonField(row.list_circular_images);

      // Insert all data in single table with JSON columns
      await databaseService.batchInsertUserRecap([
        {
          user_id: userId,
          user_name: String(row.user_name || ''),
          trx_count: parseInt(row.trx_count as any) || 0,
          variant_count: row.variant_count ? parseInt(row.variant_count as any) : undefined,
          total_point: row.total_point ? parseInt(row.total_point as any) : undefined,
          total_point_description: row.total_point_description
            ? String(row.total_point_description)
            : undefined,
          total_point_possible_redeem: row.total_point_possible_redeem
            ? parseInt(row.total_point_possible_redeem as any)
            : undefined,
          total_point_image: row.total_point_image ? String(row.total_point_image) : undefined,
          delivery_count: row.delivery_count ? parseInt(row.delivery_count as any) : undefined,
          pickup_count: row.pickup_count ? parseInt(row.pickup_count as any) : undefined,
          cheaper_subs_desc: row.cheaper_subs_desc ? String(row.cheaper_subs_desc) : undefined,
          cheaper_subs_amount: row.cheaper_subs_amount
            ? parseFloat(row.cheaper_subs_amount as any)
            : undefined,
          top_ranking: row.top_ranking ? parseInt(row.top_ranking as any) : undefined,
          list_circular_images: circularImages,
          list_product_favorite: products && Array.isArray(products)
            ? products.map((p: any) => ({
                productName: p.productName || '',
                countCups: parseInt(p.countCups || 0),
                productImage: p.productImage || undefined,
              }))
            : null,
          list_favorite_store: stores && Array.isArray(stores)
            ? stores.map((s: any) => ({
                storeName: s.storeName || '',
                transactionCount: parseInt(s.transactionCount || 0),
                storeImage: s.storeImage || undefined,
              }))
            : null,
        },
      ]);

      success++;
    } catch (error) {
      errors++;
      console.error(`Error processing user_id ${row.user_id}:`, error);
    }
  }

  return { success, errors };
}

async function main() {
  const excelPath = process.argv[2];

  if (!excelPath) {
    console.error('Usage: npm run import:excel <path-to-excel-file>');
    process.exit(1);
  }

  console.log(`Reading Excel file: ${excelPath}`);

  // Read Excel file
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

  console.log(`✓ Loaded ${data.length} rows`);

  // Initialize NestJS app
  const app = await NestFactory.createApplicationContext(AppModule);
  const databaseService = app.get(DatabaseService);
  const redisService = app.get(RedisService);

  // Process in batches
  let totalSuccess = 0;
  let totalErrors = 0;
  const startTime = Date.now();

  console.log(`\nProcessing ${data.length} rows in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(data.length / BATCH_SIZE);

    console.log(
      `\nBatch ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + BATCH_SIZE, data.length)})`,
    );

    const { success, errors } = await processBatch(
      databaseService,
      redisService,
      batch,
    );

    totalSuccess += success;
    totalErrors += errors;

    console.log(`  ✓ Batch completed: ${success} success, ${errors} errors`);
  }

  const elapsed = (Date.now() - startTime) / 1000;

  console.log(`\n${'='.repeat(60)}`);
  console.log('Import completed!');
  console.log(`  Total rows: ${data.length}`);
  console.log(`  Success: ${totalSuccess}`);
  console.log(`  Errors: ${totalErrors}`);
  console.log(`  Time elapsed: ${elapsed.toFixed(2)}s`);
  console.log(`  Rate: ${(totalSuccess / elapsed).toFixed(2)} rows/second`);
  console.log(`${'='.repeat(60)}`);

  await app.close();
  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
