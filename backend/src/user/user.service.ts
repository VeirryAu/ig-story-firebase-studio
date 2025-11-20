import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../database/redis.service';
import { MetricsService } from '../metrics/metrics.service';
import { AppLogger } from '../common/logger.service';

@Injectable()
export class UserService {
  private readonly logger = new AppLogger();

  constructor(
    private databaseService: DatabaseService,
    private redisService: RedisService,
    @Inject(forwardRef(() => MetricsService))
    private metricsService?: MetricsService,
  ) {
    this.logger.setContext('UserService');
  }

  async getUserRecap(userId: number): Promise<any> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // 1. Try cache first
      const cacheStart = Date.now();
      let cached: any = null;
      
      try {
        cached = await this.redisService.getUserRecap(userId);
      } catch (error) {
        this.logger.logError(
          error instanceof Error ? error : new Error(String(error)),
          {
            userId,
            requestId,
            operation: 'cache_get',
            stage: 'cache_lookup',
            errorType: error instanceof Error ? error.constructor.name : typeof error,
            errorMessage: error instanceof Error ? error.message : String(error),
            cacheDuration: (Date.now() - cacheStart) / 1000,
          },
        );
        // Continue to database on cache error
      }
      
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
      let hasLock = false;
      try {
        hasLock = await this.redisService.acquireLock(userId);
      } catch (error) {
        this.logger.logWarning('Failed to acquire lock', {
          userId,
          requestId,
          operation: 'lock_acquire',
          error: error instanceof Error ? error.message : String(error),
        });
        // Continue without lock
      }

      // If lock exists, wait briefly and retry cache
      if (!hasLock) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        try {
          const retryCache = await this.redisService.getUserRecap(userId);
          if (retryCache) {
            return retryCache;
          }
        } catch (error) {
          // Log but continue
          this.logger.logWarning('Cache retry failed', {
            userId,
            requestId,
            operation: 'cache_retry',
          });
        }
      }

      // 3. Fetch from database
      const dbStart = Date.now();
      let data: any = null;
      
      try {
        data = await this.databaseService.getUserRecap(userId);
      } catch (error) {
        const dbDuration = (Date.now() - dbStart) / 1000;
        this.logger.logError(
          error instanceof Error ? error : new Error(String(error)),
          {
            userId,
            requestId,
            operation: 'database_query',
            stage: 'get_user_recap',
            dbDuration,
            query: 'SELECT * FROM user_recap_data WHERE user_id = ?',
            errorType: error instanceof Error ? error.constructor.name : typeof error,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
            hasLock,
            totalDuration: (Date.now() - startTime) / 1000,
          },
        );
        throw error; // Re-throw to be handled by controller
      }
      
      const dbDuration = (Date.now() - dbStart) / 1000;
      
      if (this.metricsService) {
        this.metricsService.dbQueryDuration
          .labels('select', 'user_recap_data')
          .observe(dbDuration);
      }

      if (!data) {
        // Release lock if we have it
        if (hasLock) {
          try {
            await this.redisService.releaseLock(userId);
          } catch (error) {
            this.logger.logWarning('Failed to release lock', {
              userId,
              requestId,
              operation: 'lock_release',
            });
          }
        }
        return null;
      }

      // 4. Store in cache
      const cacheSetStart = Date.now();
      try {
        await this.redisService.setUserRecap(userId, data);
      } catch (error) {
        this.logger.logWarning('Failed to set cache', {
          userId,
          requestId,
          operation: 'cache_set',
          error: error instanceof Error ? error.message : String(error),
        });
        // Continue even if cache set fails
      }
      
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
        try {
          await this.redisService.releaseLock(userId);
        } catch (error) {
          this.logger.logWarning('Failed to release lock after cache set', {
            userId,
            requestId,
            operation: 'lock_release',
          });
        }
      }

      return data;
    } catch (error) {
      const totalDuration = (Date.now() - startTime) / 1000;
      this.logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          requestId,
          operation: 'get_user_recap',
          totalDuration,
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          stage: 'service_error',
        },
      );
      throw error;
    }
  }

  async invalidateCache(userId: number): Promise<void> {
    const key = `user:recap:${userId}`;
    await this.redisService.del(key);
  }
}

