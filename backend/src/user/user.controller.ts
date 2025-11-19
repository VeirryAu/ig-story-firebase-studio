import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { validateAuthHeaders } from '../auth/auth.utils';

@ApiTags('User')
@Controller('api/user-data')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    // Validate authentication
    const authResult = validateAuthHeaders({
      timestamp,
      user_id: userId,
      sign,
    });

    if (!authResult.valid) {
      throw new UnauthorizedException(authResult.error);
    }

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      throw new UnauthorizedException('Invalid user_id');
    }

    const userData = await this.userService.getUserRecap(userIdNum);

    if (!userData) {
      return {
        error: 'User not found',
      };
    }

    return userData;
  }
}

