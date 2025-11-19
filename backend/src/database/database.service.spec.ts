import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { ConfigService } from '@nestjs/config';
import { MetricsService } from '../metrics/metrics.service';
import { mockMysqlPool, mockMysqlConnection, mockUserData } from '../../test/helpers/mocks';
import * as mysql from 'mysql2/promise';

// Mock mysql2/promise
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(),
}));

describe('DatabaseService', () => {
  let service: DatabaseService;
  let mockPool: any;
  let configService: jest.Mocked<ConfigService>;
  let metricsService: jest.Mocked<MetricsService>;

  beforeEach(async () => {
    mockPool = {
      ...mockMysqlPool,
      getConnection: jest.fn().mockResolvedValue(mockMysqlConnection),
    };

    (mysql.createPool as jest.Mock).mockReturnValue(mockPool);

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          MYSQL_HOST: 'localhost',
          MYSQL_DATABASE: 'test_db',
          MYSQL_USER: 'test_user',
          MYSQL_PASSWORD: 'test_password',
          MYSQL_CONNECTION_LIMIT: '20',
        };
        return config[key] || defaultValue;
      }),
    };

    const mockMetricsService = {
      updateConnectionPool: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    configService = module.get(ConfigService);
    metricsService = module.get(MetricsService);
    
    // Initialize pool (simulate onModuleInit)
    await service.onModuleInit();
    
    // Verify pool was created
    expect((service as any).pool).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserRecap', () => {
    it('should return user data when found', async () => {
      const userId = 12345;
      const mockRows = [[mockUserData]];
      mockMysqlConnection.execute.mockResolvedValue(mockRows);
      mockPool.getConnection.mockResolvedValue(mockMysqlConnection);

      const result = await service.getUserRecap(userId);

      expect(result).toEqual(mockUserData);
      expect(mockMysqlConnection.execute).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [userId],
      );
      expect(mockMysqlConnection.release).toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      const userId = 12345;
      mockMysqlConnection.execute.mockResolvedValue([[]]);
      mockPool.getConnection.mockResolvedValue(mockMysqlConnection);

      const result = await service.getUserRecap(userId);

      expect(result).toBeNull();
      expect(mockMysqlConnection.release).toHaveBeenCalled();
    });

    it('should parse JSON fields correctly', async () => {
      const userId = 12345;
      const userDataWithJsonString = {
        ...mockUserData,
        listCircularImages: JSON.stringify([{ url: 'test.jpg' }]),
        listProductFavorite: JSON.stringify([{ id: 1 }]),
        listFavoriteStore: JSON.stringify([{ id: 1 }]),
      };
      mockMysqlConnection.execute.mockResolvedValue([[userDataWithJsonString]]);
      mockPool.getConnection.mockResolvedValue(mockMysqlConnection);

      const result = await service.getUserRecap(userId);

      expect(result.listCircularImages).toEqual([{ url: 'test.jpg' }]);
      expect(result.listProductFavorite).toEqual([{ id: 1 }]);
      expect(result.listFavoriteStore).toEqual([{ id: 1 }]);
    });

    it('should handle invalid JSON gracefully', async () => {
      const userId = 12345;
      const userDataWithInvalidJson = {
        ...mockUserData,
        listCircularImages: 'invalid json',
      };
      mockMysqlConnection.execute.mockResolvedValue([[userDataWithInvalidJson]]);
      mockPool.getConnection.mockResolvedValue(mockMysqlConnection);

      const result = await service.getUserRecap(userId);

      expect(result.listCircularImages).toBeNull();
    });

    it('should handle database errors', async () => {
      const userId = 12345;
      mockMysqlConnection.execute.mockRejectedValue(new Error('Database error'));
      mockPool.getConnection.mockResolvedValue(mockMysqlConnection);

      await expect(service.getUserRecap(userId)).rejects.toThrow('Database error');
      expect(mockMysqlConnection.release).toHaveBeenCalled();
    });

    it('should release connection even on error', async () => {
      const userId = 12345;
      mockMysqlConnection.execute.mockRejectedValue(new Error('Database error'));
      mockPool.getConnection.mockResolvedValue(mockMysqlConnection);

      try {
        await service.getUserRecap(userId);
      } catch (error) {
        // Expected
      }

      expect(mockMysqlConnection.release).toHaveBeenCalled();
    });
  });
});

