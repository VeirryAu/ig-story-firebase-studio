import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AppLogger } from '../common/logger.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private readonly CACHE_TTL_MINUTES = parseInt(this.configService.get('CACHE_TTL_MINUTES', '15') ?? '15');
  private readonly CACHE_TTL = this.CACHE_TTL_MINUTES * 60; // seconds
  private readonly CACHE_PREFIX = this.configService.get('CACHE_PREFIX', 'user:recap:');
  private readonly LOCK_TTL = parseInt(this.configService.get('LOCK_TTL', '10') ?? '10'); // seconds
  private readonly logger = new AppLogger();

  constructor(private configService: ConfigService) {
    this.logger.setContext('RedisService');
  }

  async onModuleInit() {
    try {
      this.client = new Redis({
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: parseInt(this.configService.get('REDIS_PORT', '6379')),
        password: this.configService.get('REDIS_PASSWORD'),
        db: 0,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.client.on('error', (err) => {
        this.logger.logError(err, {
          operation: 'redis_connection',
          event: 'error',
        });
      });

      await this.client.ping();
      this.logger.log('Redis connected successfully');
    } catch (error) {
      this.logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'redis_connection',
          stage: 'initialization',
        },
      );
      this.logger.logWarning('Redis connection failed, continuing without cache', {
        operation: 'redis_connection',
      });
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'redis_get',
          key,
        },
      );
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.client) return;
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'redis_set',
          key,
          hasTtl: !!ttl,
          ttl,
        },
      );
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'redis_del',
          key,
        },
      );
    }
  }

  async getUserRecap(userId: number): Promise<any | null> {
    if (!this.client) return null;
    const key = `${this.CACHE_PREFIX}${userId}`;
    try {
      const cached = await this.get(key);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Validate parsed data structure
          if (typeof parsed !== 'object' || parsed === null) {
            throw new Error('Parsed cache data is not an object');
          }
          return parsed;
        } catch (error) {
          // Log detailed error information
          const errorMessage = error instanceof Error ? error.message : String(error);
          const rawValuePreview = cached.length > 500 
            ? cached.substring(0, 500) + '...' 
            : cached;
          
          this.logger.logError(
            error instanceof Error ? error : new Error(String(error)),
            {
              userId,
              operation: 'cache_json_parse',
              key,
              errorType: error instanceof Error ? error.constructor.name : typeof error,
              errorMessage,
              rawValueLength: cached.length,
              rawValuePreview,
              cacheKey: key,
            },
          );
          
          // Delete invalid cache entry
          try {
            await this.del(key);
            this.logger.logWarning('Deleted invalid cache entry', {
              userId,
              operation: 'cache_cleanup',
              key,
            });
          } catch (delError) {
            this.logger.logError(
              delError instanceof Error ? delError : new Error(String(delError)),
              {
                userId,
                operation: 'cache_cleanup',
                key,
                stage: 'delete_invalid_entry',
              },
            );
          }
          return null;
        }
      }
      return null;
    } catch (error) {
      this.logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          operation: 'get_user_recap_cache',
          key,
          stage: 'cache_lookup',
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      );
      return null;
    }
  }

  async setUserRecap(userId: number, data: any): Promise<void> {
    if (!this.client) return;
    const key = `${this.CACHE_PREFIX}${userId}`;
    try {
      const jsonData = JSON.stringify(data);
      await this.set(key, jsonData, this.CACHE_TTL);
    } catch (error) {
      this.logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          operation: 'set_user_recap_cache',
          key,
        },
      );
    }
  }

  async acquireLock(userId: number): Promise<boolean> {
    if (!this.client) return false;
    const lockKey = `${this.CACHE_PREFIX}${userId}:lock`;
    try {
      const result = await this.client.set(
        lockKey,
        '1',
        'EX',
        this.LOCK_TTL,
        'NX',
      );
      return result === 'OK';
    } catch (error) {
      this.logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          operation: 'acquire_lock',
          lockKey,
        },
      );
      return false;
    }
  }

  async releaseLock(userId: number): Promise<void> {
    if (!this.client) return;
    const lockKey = `${this.CACHE_PREFIX}${userId}:lock`;
    try {
      await this.del(lockKey);
    } catch (error) {
      this.logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          operation: 'release_lock',
          lockKey,
        },
      );
    }
  }
}

