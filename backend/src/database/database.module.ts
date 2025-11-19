import { Module, Global, forwardRef } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { RedisService } from './redis.service';
import { MetricsModule } from '../metrics/metrics.module';

@Global()
@Module({
  imports: [forwardRef(() => MetricsModule)],
  providers: [DatabaseService, RedisService],
  exports: [DatabaseService, RedisService],
})
export class DatabaseModule {}

