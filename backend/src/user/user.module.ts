import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [forwardRef(() => MetricsModule)],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

