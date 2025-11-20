import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { validateAuthHeaders } from '../auth/auth.utils';
import { AppLogger } from '../common/logger.service';

@ApiTags('User')
@Controller('api/user-data')
export class UserController {
  private readonly logger = new AppLogger();

  constructor(private readonly userService: UserService) {
    this.logger.setContext('UserController');
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user recap data' })
  @ApiSecurity('ApiKeyAuth')
  @ApiResponse({
    status: 200,
    description: 'User recap data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserData(
    @Headers('timestamp') timestamp: string,
    @Headers('user_id') userId: string,
    @Headers('sign') sign: string,
  ) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      // Validate authentication
      const authResult = validateAuthHeaders({
        timestamp,
        user_id: userId,
        sign,
      });

      if (!authResult.valid) {
        this.logger.logWarning('Authentication failed', {
          userId: userId || 'unknown',
          requestId,
          operation: 'auth_validation',
          error: authResult.error,
          headers: {
            timestamp: timestamp?.substring(0, 20) + '...',
            user_id: userId,
            has_sign: !!sign,
          },
        });
        throw new UnauthorizedException(authResult.error);
      }

      const userIdNum = parseInt(userId, 10);
      if (isNaN(userIdNum)) {
        this.logger.logWarning('Invalid user_id format', {
          userId: userId || 'unknown',
          requestId,
          operation: 'user_id_validation',
          providedUserId: userId,
        });
        throw new UnauthorizedException('Invalid user_id');
      }

      let userData: any = null;
      
      try {
        userData = await this.userService.getUserRecap(userIdNum);
      } catch (error) {
        const duration = Date.now() - startTime;
        this.logger.logError(
          error instanceof Error ? error : new Error(String(error)),
          {
            userId: userIdNum,
            requestId,
            operation: 'get_user_data',
            duration,
            stage: 'service_call',
          },
        );
        throw new InternalServerErrorException('Failed to retrieve user data');
      }

      if (!userData) {
        const duration = Date.now() - startTime;
        this.logger.logWarning('User not found', {
          userId: userIdNum,
          requestId,
          operation: 'get_user_data',
          duration,
        });
        return {
          error: 'User not found',
        };
      }

      const duration = Date.now() - startTime;
      if (duration > 1000) {
        // Log slow requests
        this.logger.logWarning('Slow request', {
          userId: userIdNum,
          requestId,
          operation: 'get_user_data',
          duration,
        });
      }

      return userData;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Re-throw known exceptions
      if (error instanceof UnauthorizedException || error instanceof InternalServerErrorException) {
        throw error;
      }

      // Log unexpected errors
      this.logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          userId: userId || 'unknown',
          requestId,
          operation: 'get_user_data',
          duration,
          stage: 'controller',
        },
      );

      throw new InternalServerErrorException('Internal server error');
    }
  }
}

