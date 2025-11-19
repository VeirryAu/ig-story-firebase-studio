import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UnauthorizedException } from '@nestjs/common';
import { mockUserData, createMockAuthHeaders } from '../../test/helpers/mocks';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockUserService = {
      getUserRecap: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserData', () => {
    it('should return user data with valid headers', async () => {
      const headers = createMockAuthHeaders();
      userService.getUserRecap.mockResolvedValue(mockUserData);

      const result = await controller.getUserData(
        headers.timestamp,
        headers.user_id,
        headers.sign,
      );

      expect(result).toEqual(mockUserData);
      expect(userService.getUserRecap).toHaveBeenCalledWith(12345);
    });

    it('should throw UnauthorizedException for invalid timestamp', async () => {
      const headers = createMockAuthHeaders({ timestamp: '' });

      await expect(
        controller.getUserData(headers.timestamp, headers.user_id, headers.sign),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid user_id', async () => {
      const headers = createMockAuthHeaders({ user_id: '' });

      await expect(
        controller.getUserData(headers.timestamp, headers.user_id, headers.sign),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid signature', async () => {
      const headers = createMockAuthHeaders({ sign: 'invalid' });

      await expect(
        controller.getUserData(headers.timestamp, headers.user_id, headers.sign),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-numeric user_id', async () => {
      const headers = createMockAuthHeaders({ user_id: 'not_a_number' });

      await expect(
        controller.getUserData(headers.timestamp, headers.user_id, headers.sign),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return error object when user not found', async () => {
      const headers = createMockAuthHeaders();
      userService.getUserRecap.mockResolvedValue(null);

      const result = await controller.getUserData(
        headers.timestamp,
        headers.user_id,
        headers.sign,
      );

      expect(result).toEqual({ error: 'User not found' });
    });

    it('should handle service errors', async () => {
      const headers = createMockAuthHeaders();
      userService.getUserRecap.mockRejectedValue(new Error('Service error'));

      await expect(
        controller.getUserData(headers.timestamp, headers.user_id, headers.sign),
      ).rejects.toThrow('Service error');
    });
  });
});

