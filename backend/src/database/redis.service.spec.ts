import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { ConfigService } from '@nestjs/config';
import { mockRedisClient, mockUserData } from '../../test/helpers/mocks';

describe('RedisService', () => {
  let service: RedisService;
  let mockClient: any;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    mockClient = {
      ...mockRedisClient,
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      ping: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          REDIS_HOST: 'localhost',
          REDIS_PORT: '6379',
          REDIS_PASSWORD: '',
          CACHE_TTL_SECONDS: '3600',
        };
        return config[key] || defaultValue;
      }),
    };

    // Mock ioredis
    jest.mock('ioredis', () => {
      return jest.fn(() => mockClient);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    configService = module.get(ConfigService);
    
    // Inject mock client
    (service as any).client = mockClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserRecap', () => {
    it('should return cached data when available', async () => {
      const userId = 12345;
      const cachedData = JSON.stringify(mockUserData);
      mockClient.get.mockResolvedValue(cachedData);

      const result = await service.getUserRecap(userId);

      expect(result).toEqual(mockUserData);
      expect(mockClient.get).toHaveBeenCalledWith(`user:recap:${userId}`);
    });

    it('should return null when cache miss', async () => {
      const userId = 12345;
      mockClient.get.mockResolvedValue(null);

      const result = await service.getUserRecap(userId);

      expect(result).toBeNull();
    });

    it('should handle invalid JSON gracefully', async () => {
      const userId = 12345;
      mockClient.get.mockResolvedValue('invalid json');

      await expect(service.getUserRecap(userId)).rejects.toThrow();
    });

    it('should handle Redis errors gracefully', async () => {
      const userId = 12345;
      mockClient.get.mockRejectedValue(new Error('Redis error'));

      // Redis service handles errors gracefully and returns null
      const result = await service.getUserRecap(userId);
      expect(result).toBeNull();
    });
  });

  describe('setUserRecap', () => {
    it('should set cache with TTL', async () => {
      const userId = 12345;
      mockClient.setex.mockResolvedValue('OK');

      await service.setUserRecap(userId, mockUserData);

      // TTL is 15 minutes (900 seconds) by default, or from CACHE_TTL_MINUTES env
      expect(mockClient.setex).toHaveBeenCalledWith(
        `user:recap:${userId}`,
        expect.any(Number), // TTL in seconds
        JSON.stringify(mockUserData),
      );
    });

    it('should handle Redis errors gracefully', async () => {
      const userId = 12345;
      mockClient.setex.mockRejectedValue(new Error('Redis error'));

      // Redis service handles errors gracefully (doesn't throw)
      await service.setUserRecap(userId, mockUserData);
      expect(mockClient.setex).toHaveBeenCalled();
    });
  });

  describe('acquireLock', () => {
    it('should acquire lock when available', async () => {
      const userId = 12345;
      mockClient.set.mockResolvedValue('OK');

      const result = await service.acquireLock(userId);

      expect(result).toBe(true);
      expect(mockClient.set).toHaveBeenCalledWith(
        `user:recap:${userId}:lock`,
        '1',
        'EX',
        10,
        'NX',
      );
    });

    it('should return false when lock exists', async () => {
      const userId = 12345;
      mockClient.set.mockResolvedValue(null);

      const result = await service.acquireLock(userId);

      expect(result).toBe(false);
    });
  });

  describe('releaseLock', () => {
    it('should delete lock', async () => {
      const userId = 12345;
      mockClient.del.mockResolvedValue(1);

      await service.releaseLock(userId);

      expect(mockClient.del).toHaveBeenCalledWith(`user:recap:${userId}:lock`);
    });
  });

  describe('del', () => {
    it('should delete key', async () => {
      const key = 'test:key';
      mockClient.del.mockResolvedValue(1);

      await service.del(key);

      expect(mockClient.del).toHaveBeenCalledWith(key);
    });
  });
});

