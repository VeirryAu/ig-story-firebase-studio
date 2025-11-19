import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../database/redis.service';
import { MetricsService } from '../metrics/metrics.service';
import { mockUserData, mockRedisClient, mockMysqlConnection } from '../../test/helpers/mocks';

describe('UserService', () => {
  let service: UserService;
  let databaseService: jest.Mocked<DatabaseService>;
  let redisService: jest.Mocked<RedisService>;
  let metricsService: jest.Mocked<MetricsService>;

  beforeEach(async () => {
    const mockDatabaseService = {
      getUserRecap: jest.fn(),
      getPool: jest.fn(),
    };

    const mockRedisService = {
      getUserRecap: jest.fn(),
      setUserRecap: jest.fn(),
      acquireLock: jest.fn(),
      releaseLock: jest.fn(),
      del: jest.fn(),
    };

    const mockMetricsService = {
      cacheHits: {
        labels: jest.fn().mockReturnValue({ inc: jest.fn() }),
      },
      cacheMisses: {
        labels: jest.fn().mockReturnValue({ inc: jest.fn() }),
      },
      cacheOperations: {
        labels: jest.fn().mockReturnValue({ observe: jest.fn() }),
      },
      dbQueryDuration: {
        labels: jest.fn().mockReturnValue({ observe: jest.fn() }),
      },
      apiResponseTime: {
        labels: jest.fn().mockReturnValue({ observe: jest.fn() }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    databaseService = module.get(DatabaseService);
    redisService = module.get(RedisService);
    metricsService = module.get(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserRecap', () => {
    it('should return cached data if available', async () => {
      const userId = 12345;
      redisService.getUserRecap.mockResolvedValue(mockUserData);

      const result = await service.getUserRecap(userId);

      expect(result).toEqual(mockUserData);
      expect(redisService.getUserRecap).toHaveBeenCalledWith(userId);
      expect(databaseService.getUserRecap).not.toHaveBeenCalled();
      expect(metricsService.cacheHits.labels).toHaveBeenCalledWith('redis');
    });

    it('should fetch from database if cache miss', async () => {
      const userId = 12345;
      redisService.getUserRecap.mockResolvedValue(null);
      redisService.acquireLock.mockResolvedValue(true);
      databaseService.getUserRecap.mockResolvedValue(mockUserData);
      redisService.setUserRecap.mockResolvedValue(undefined);

      const result = await service.getUserRecap(userId);

      expect(result).toEqual(mockUserData);
      expect(redisService.getUserRecap).toHaveBeenCalledWith(userId);
      expect(databaseService.getUserRecap).toHaveBeenCalledWith(userId);
      expect(redisService.setUserRecap).toHaveBeenCalledWith(userId, mockUserData);
      expect(metricsService.cacheMisses.labels).toHaveBeenCalledWith('redis');
    });

    it('should retry cache if lock exists', async () => {
      const userId = 12345;
      redisService.getUserRecap
        .mockResolvedValueOnce(null) // First cache miss
        .mockResolvedValueOnce(mockUserData); // Retry cache hit
      redisService.acquireLock.mockResolvedValue(false);

      const result = await service.getUserRecap(userId);

      expect(result).toEqual(mockUserData);
      expect(redisService.getUserRecap).toHaveBeenCalledTimes(2);
      expect(databaseService.getUserRecap).not.toHaveBeenCalled();
    });

    it('should return null if user not found', async () => {
      const userId = 12345;
      redisService.getUserRecap.mockResolvedValue(null);
      redisService.acquireLock.mockResolvedValue(true);
      databaseService.getUserRecap.mockResolvedValue(null);

      const result = await service.getUserRecap(userId);

      expect(result).toBeNull();
      expect(redisService.releaseLock).toHaveBeenCalledWith(userId);
      expect(redisService.setUserRecap).not.toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      const userId = 12345;
      // Redis service returns null on error, doesn't throw
      redisService.getUserRecap.mockResolvedValue(null);
      redisService.acquireLock.mockResolvedValue(true);
      databaseService.getUserRecap.mockResolvedValue(mockUserData);

      const result = await service.getUserRecap(userId);

      expect(result).toEqual(mockUserData);
      expect(databaseService.getUserRecap).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const userId = 12345;
      redisService.getUserRecap.mockResolvedValue(null);
      redisService.acquireLock.mockResolvedValue(true);
      databaseService.getUserRecap.mockRejectedValue(new Error('Database error'));

      await expect(service.getUserRecap(userId)).rejects.toThrow('Database error');
    });
  });

  describe('invalidateCache', () => {
    it('should delete cache key', async () => {
      const userId = 12345;
      redisService.del.mockResolvedValue(undefined);

      await service.invalidateCache(userId);

      expect(redisService.del).toHaveBeenCalledWith(`user:recap:${userId}`);
    });
  });
});

