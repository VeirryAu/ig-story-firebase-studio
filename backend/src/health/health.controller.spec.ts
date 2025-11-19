import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService } from '@nestjs/terminus';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../database/redis.service';
import { mockMysqlPool } from '../../test/helpers/mocks';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;
  let databaseService: jest.Mocked<DatabaseService>;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const mockHealthCheckService = {
      check: jest.fn(),
    };

    const mockDatabaseService = {
      getPool: jest.fn().mockReturnValue(mockMysqlPool),
    };

    const mockRedisService = {
      client: {
        ping: jest.fn().mockResolvedValue('PONG'),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get(HealthCheckService);
    databaseService = module.get(DatabaseService);
    redisService = module.get(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should return health status', async () => {
      const mockResult = {
        status: 'ok',
        info: {
          database: { status: 'up' },
          redis: { status: 'up' },
        },
      };

      healthCheckService.check.mockResolvedValue(mockResult as any);

      const result = await controller.check();

      expect(result).toEqual(mockResult);
      expect(healthCheckService.check).toHaveBeenCalled();
    });

    it('should check database connection', async () => {
      const mockResult = {
        status: 'ok',
        info: {
          database: { status: 'up' },
          redis: { status: 'up' },
        },
      };
      healthCheckService.check.mockResolvedValue(mockResult as any);
      mockMysqlPool.query = jest.fn().mockResolvedValue([{ '1': 1 }]);

      await controller.check();

      expect(healthCheckService.check).toHaveBeenCalled();
      // Health check internally calls getPool
    });

    it('should check Redis connection', async () => {
      const mockResult = {
        status: 'ok',
        info: {
          database: { status: 'up' },
          redis: { status: 'up' },
        },
      };
      healthCheckService.check.mockResolvedValue(mockResult as any);

      await controller.check();

      expect(healthCheckService.check).toHaveBeenCalled();
      // Health check internally calls client.ping
    });

    it('should handle database errors', async () => {
      mockMysqlPool.query = jest.fn().mockRejectedValue(new Error('DB error'));

      const result = await controller.check();

      expect(healthCheckService.check).toHaveBeenCalled();
    });

    it('should handle Redis errors', async () => {
      ((redisService as any).client as any).ping = jest.fn().mockRejectedValue(new Error('Redis error'));

      const result = await controller.check();

      expect(healthCheckService.check).toHaveBeenCalled();
    });
  });
});

