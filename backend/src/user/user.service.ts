import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../database/redis.service';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class UserService {
  constructor(
    private databaseService: DatabaseService,
    private redisService: RedisService,
    @Inject(forwardRef(() => MetricsService))
    private metricsService?: MetricsService,
  ) {}

  async getUserRecap(userId: number): Promise<any> {
    const startTime = Date.now();
    
    // 1. Try cache first
    const cacheStart = Date.now();
    const cached = await this.redisService.getUserRecap(userId);
    const cacheDuration = (Date.now() - cacheStart) / 1000;
    
    if (cached) {
      if (this.metricsService) {
        this.metricsService.cacheHits.labels('redis').inc();
        this.metricsService.cacheOperations
          .labels('get', 'redis')
          .observe(cacheDuration);
      }
      return cached;
    }
    
    if (this.metricsService) {
      this.metricsService.cacheMisses.labels('redis').inc();
    }

    // 2. Try to acquire lock (prevent cache stampede)
    const hasLock = await this.redisService.acquireLock(userId);

    // If lock exists, wait briefly and retry cache
    if (!hasLock) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const retryCache = await this.redisService.getUserRecap(userId);
      if (retryCache) {
        return retryCache;
      }
    }

    // 3. Fetch from database
    const dbStart = Date.now();
    const data = await this.databaseService.getUserRecap(userId);
    const dbDuration = (Date.now() - dbStart) / 1000;
    
    if (this.metricsService) {
      this.metricsService.dbQueryDuration
        .labels('select', 'user_recap_data')
        .observe(dbDuration);
    }

    if (!data) {
      // Release lock if we have it
      if (hasLock) {
        await this.redisService.releaseLock(userId);
      }
      return null;
    }

    // 4. Store in cache
    const cacheSetStart = Date.now();
    await this.redisService.setUserRecap(userId, data);
    const cacheSetDuration = (Date.now() - cacheSetStart) / 1000;
    
    if (this.metricsService) {
      this.metricsService.cacheOperations
        .labels('set', 'redis')
        .observe(cacheSetDuration);
    }
    
    // Record total API response time
    const totalDuration = (Date.now() - startTime) / 1000;
    if (this.metricsService) {
      this.metricsService.apiResponseTime
        .labels('getUserRecap')
        .observe(totalDuration);
    }

    // 5. Release lock
    if (hasLock) {
      await this.redisService.releaseLock(userId);
    }

    return data;
  }

  async invalidateCache(userId: number): Promise<void> {
    const key = `user:recap:${userId}`;
    await this.redisService.del(key);
  }
}

