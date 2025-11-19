import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'user:recap:';
  private readonly LOCK_TTL = 10; // 10 seconds

  constructor(private configService: ConfigService) {}

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
        console.error('Redis error:', err);
      });

      await this.client.ping();
      console.log('✓ Redis connected');
    } catch (error) {
      console.error('Redis connection failed, continuing without cache:', error);
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
      console.error('Redis get error:', error);
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
      console.error('Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  async getUserRecap(userId: number): Promise<any | null> {
    if (!this.client) return null;
    const key = `${this.CACHE_PREFIX}${userId}`;
    const cached = await this.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  }

  async setUserRecap(userId: number, data: any): Promise<void> {
    if (!this.client) return;
    const key = `${this.CACHE_PREFIX}${userId}`;
    await this.set(key, JSON.stringify(data), this.CACHE_TTL);
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
      console.error('Redis lock error:', error);
      return false;
    }
  }

  async releaseLock(userId: number): Promise<void> {
    if (!this.client) return;
    const lockKey = `${this.CACHE_PREFIX}${userId}:lock`;
    await this.del(lockKey);
  }
}

