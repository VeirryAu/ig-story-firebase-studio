/**
 * Generate 10 million test user records for load testing
 * Usage: npm run generate:test-data
 * 
 * This script generates realistic test data with:
 * - Random user IDs (1 to 10,000,000)
 * - Varied transaction counts
 * - Realistic product/store data
 * - JSON arrays for products and stores
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DatabaseService } from '../database/database.service';
import 'reflect-metadata';

interface TestUser {
  user_id: number;
  user_name: string;
  trx_count: number;
  variant_count?: number;
  total_point?: number;
  total_point_possible_redeem?: number;
  total_point_product_name?: string;
  total_point_image?: string;
  delivery_count?: number;
  pickup_count?: number;
  cheaper_subs_desc?: string;
  cheaper_subs_amount?: number;
  top_ranking?: number;
  list_circular_images?: any;
  list_product_favorite?: any;
  list_favorite_store?: any;
}

const TOTAL_USERS = 10000000; // 10 million
const BATCH_SIZE = 5000; // Smaller batches for large dataset
const PRODUCTS = [
  'Espresso', 'Cappuccino', 'Latte', 'Americano', 'Mocha',
  'Macchiato', 'Flat White', 'Cold Brew', 'Frappuccino', 'Iced Latte'
];
const STORES = [
  'Fore Coffee Grand Indonesia', 'Fore Coffee Plaza Indonesia',
  'Fore Coffee Senayan City', 'Fore Coffee Central Park',
  'Fore Coffee Pacific Place', 'Fore Coffee Mall Kelapa Gading',
  'Fore Coffee Pondok Indah Mall', 'Fore Coffee Kemang'
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateProductList(trxCount: number): any[] {
  const productCount = Math.min(randomInt(1, 5), Math.floor(trxCount / 10) || 1);
  const products: any[] = [];
  const usedProducts = new Set<string>();

  for (let i = 0; i < productCount; i++) {
    let productName = randomChoice(PRODUCTS);
    while (usedProducts.has(productName) && usedProducts.size < PRODUCTS.length) {
      productName = randomChoice(PRODUCTS);
    }
    usedProducts.add(productName);

    products.push({
      productName,
      countCups: randomInt(1, Math.floor(trxCount / productCount) || 1),
      productImage: `https://example.com/images/${productName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    });
  }

  // Sort by countCups descending
  return products.sort((a, b) => b.countCups - a.countCups);
}

function generateStoreList(trxCount: number): any[] {
  const storeCount = Math.min(randomInt(1, 3), Math.floor(trxCount / 20) || 1);
  const stores: any[] = [];
  const usedStores = new Set<string>();

  for (let i = 0; i < storeCount; i++) {
    let storeName = randomChoice(STORES);
    while (usedStores.has(storeName) && usedStores.size < STORES.length) {
      storeName = randomChoice(STORES);
    }
    usedStores.add(storeName);

    stores.push({
      storeName,
      transactionCount: randomInt(1, Math.floor(trxCount / storeCount) || 1),
      storeImage: `https://example.com/images/stores/${storeName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    });
  }

  // Sort by transactionCount descending
  return stores.sort((a, b) => b.transactionCount - a.transactionCount);
}

function generateUserName(userId: number): string {
  const names = [
    'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gunawan', 'Hani',
    'Indra', 'Joko', 'Kartika', 'Lina', 'Mulyadi', 'Nina', 'Oscar', 'Putri',
    'Rizki', 'Sari', 'Tono', 'Umi', 'Vina', 'Wahyu', 'Yuni', 'Zaki'
  ];
  return `${randomChoice(names)} ${randomChoice(names)}`;
}

function generateUser(userId: number): TestUser {
  // Realistic distribution: most users have low trx_count, few have high
  const rand = Math.random();
  let trxCount: number;
  
  if (rand < 0.5) {
    // 50% have 0-10 transactions
    trxCount = randomInt(0, 10);
  } else if (rand < 0.8) {
    // 30% have 11-50 transactions
    trxCount = randomInt(11, 50);
  } else if (rand < 0.95) {
    // 15% have 51-200 transactions
    trxCount = randomInt(51, 200);
  } else {
    // 5% have 201-1000 transactions (power users)
    trxCount = randomInt(201, 1000);
  }

  const variantCount = trxCount > 0 ? randomInt(1, Math.min(10, trxCount)) : 0;
  const totalPoint = trxCount > 0 ? trxCount * randomInt(8, 15) : 0;
  const deliveryCount = trxCount > 0 ? Math.floor(trxCount * randomInt(30, 70) / 100) : 0;
  const pickupCount = trxCount > 0 ? trxCount - deliveryCount : 0;
  const topRanking = trxCount > 100 ? randomInt(1, 1000) : null;

  const products = trxCount > 0 ? generateProductList(trxCount) : null;
  const stores = trxCount > 0 ? generateStoreList(trxCount) : null;

  return {
    user_id: userId,
    user_name: generateUserName(userId),
    trx_count: trxCount,
    variant_count: variantCount || null,
    total_point: totalPoint || null,
    total_point_possible_redeem: totalPoint > 0 ? Math.floor(totalPoint / 25) : null,
    total_point_product_name: totalPoint > 0 ? 'Aren Latte' : null,
    total_point_image: totalPoint > 0 ? 'https://example.com/images/latte.jpg' : null,
    delivery_count: deliveryCount || null,
    pickup_count: pickupCount || null,
    cheaper_subs_desc: trxCount > 50 ? `${randomInt(100, 500)}rb Rupiah` : null,
    cheaper_subs_amount: trxCount > 50 ? randomInt(100000, 500000) : null,
    top_ranking: topRanking,
    list_circular_images: trxCount > 0 ? [
      'https://example.com/images/circle1.jpg',
      'https://example.com/images/circle2.jpg',
      'https://example.com/images/circle3.jpg',
    ] : null,
    list_product_favorite: products,
    list_favorite_store: stores,
  };
}

async function generateBatch(
  databaseService: DatabaseService,
  startId: number,
  count: number,
): Promise<number> {
  const users: TestUser[] = [];
  
  for (let i = 0; i < count; i++) {
    const userId = startId + i;
    users.push(generateUser(userId));
  }

  try {
    await databaseService.batchInsertUserRecap(users);
    return count;
  } catch (error) {
    console.error(`Error inserting batch starting at ${startId}:`, error);
    return 0;
  }
}

async function main() {
  const totalUsers = parseInt(process.argv[2]) || TOTAL_USERS;
  const batchSize = parseInt(process.argv[3]) || BATCH_SIZE;

  console.log(`\n${'='.repeat(60)}`);
  console.log('Generating Test Data');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total users: ${totalUsers.toLocaleString()}`);
  console.log(`Batch size: ${batchSize.toLocaleString()}`);
  console.log(`Total batches: ${Math.ceil(totalUsers / batchSize).toLocaleString()}`);
  console.log(`${'='.repeat(60)}\n`);

  // Initialize NestJS app
  const app = await NestFactory.createApplicationContext(AppModule);
  const databaseService = app.get(DatabaseService);

  let totalInserted = 0;
  let totalErrors = 0;
  const startTime = Date.now();

  // Process in batches
  for (let i = 0; i < totalUsers; i += batchSize) {
    const batchStart = i + 1;
    const batchEnd = Math.min(i + batchSize, totalUsers);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(totalUsers / batchSize);

    process.stdout.write(
      `\rBatch ${batchNum}/${totalBatches} (${batchStart.toLocaleString()}-${batchEnd.toLocaleString()})... `
    );

    const inserted = await generateBatch(databaseService, batchStart, batchEnd - batchStart + 1);
    
    if (inserted > 0) {
      totalInserted += inserted;
    } else {
      totalErrors += batchSize;
    }

    // Progress update
    const progress = ((batchEnd / totalUsers) * 100).toFixed(2);
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = totalInserted / elapsed;
    const remaining = (totalUsers - batchEnd) / rate;
    
    process.stdout.write(
      `✓ ${progress}% | Rate: ${rate.toFixed(0)}/s | ETA: ${(remaining / 60).toFixed(1)}min`
    );
  }

  const elapsed = (Date.now() - startTime) / 1000;

  console.log(`\n\n${'='.repeat(60)}`);
  console.log('Generation completed!');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total users: ${totalUsers.toLocaleString()}`);
  console.log(`Successfully inserted: ${totalInserted.toLocaleString()}`);
  console.log(`Errors: ${totalErrors.toLocaleString()}`);
  console.log(`Time elapsed: ${(elapsed / 60).toFixed(2)} minutes`);
  console.log(`Average rate: ${(totalInserted / elapsed).toFixed(2)} rows/second`);
  console.log(`${'='.repeat(60)}\n`);

  await app.close();
  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

