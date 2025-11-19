import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { ConfigService } from '@nestjs/config';

describe('MetricsService', () => {
  let service: MetricsService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          SERVICE_NAME: 'test-service',
        };
        return config[key] || defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should initialize metrics', () => {
      expect(service).toBeDefined();
      expect(service.httpRequestTotal).toBeDefined();
      expect(service.httpRequestDuration).toBeDefined();
      expect(service.httpRequestErrors).toBeDefined();
    });
  });

  describe('getMetrics', () => {
    it('should return Prometheus metrics', async () => {
      const metrics = await service.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('string');
      expect(metrics).toContain('# HELP');
      expect(metrics).toContain('# TYPE');
    });
  });

  describe('updateConnectionPool', () => {
    it('should update connection pool metrics', () => {
      service.updateConnectionPool(20, 10, 10);
      
      // Metrics should be updated (no error thrown)
      expect(service).toBeDefined();
    });
  });
});

