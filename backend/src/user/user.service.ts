import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../database/redis.service';

@Injectable()
export class UserService {
  constructor(
    private databaseService: DatabaseService,
    private redisService: RedisService,
  ) {}

  async getUserRecap(userId: number): Promise<any> {
    // 1. Try cache first
    const cached = await this.redisService.getUserRecap(userId);
    if (cached) {
      return cached;
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
    const data = await this.databaseService.getUserRecap(userId);

    if (!data) {
      // Release lock if we have it
      if (hasLock) {
        await this.redisService.releaseLock(userId);
      }
      return null;
    }

    // 4. Store in cache
    await this.redisService.setUserRecap(userId, data);

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

