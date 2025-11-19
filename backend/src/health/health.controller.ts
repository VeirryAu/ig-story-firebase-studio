import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../database/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private database: DatabaseService,
    private redis: RedisService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => {
        try {
          const pool = this.database.getPool();
          await pool.query('SELECT 1');
          return { database: { status: 'up' } };
        } catch (error) {
          return { database: { status: 'down', error: error.message } };
        }
      },
      async () => {
        try {
          const client = (this.redis as any).client;
          if (client) {
            await client.ping();
            return { redis: { status: 'up' } };
          }
          return { redis: { status: 'down', error: 'Not connected' } };
        } catch (error: any) {
          return { redis: { status: 'down', error: error?.message || 'Unknown error' } };
        }
      },
    ]);
  }
}

