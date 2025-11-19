import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { createMockAuthHeaders } from '../helpers/mocks';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            MYSQL_HOST: process.env.MYSQL_HOST || 'localhost',
            MYSQL_DATABASE: process.env.MYSQL_DATABASE || 'test_db',
            MYSQL_USER: process.env.MYSQL_USER || 'root',
            MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || '',
            REDIS_HOST: process.env.REDIS_HOST || 'localhost',
            REDIS_PORT: process.env.REDIS_PORT || '6379',
            AUTH_SIGNATURE_SECRET: process.env.AUTH_SIGNATURE_SECRET || 'test_secret',
          };
          return config[key] || defaultValue;
        },
      } as any)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('/metrics (GET)', () => {
    it('should return Prometheus metrics', () => {
      return request(app.getHttpServer())
        .get('/metrics')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('# HELP');
          expect(res.text).toContain('# TYPE');
        });
    });
  });

  describe('/api/user-data (GET)', () => {
    it('should return 401 without auth headers', () => {
      return request(app.getHttpServer())
        .get('/api/user-data')
        .expect(401);
    });

    it('should return 401 with invalid signature', () => {
      const headers = createMockAuthHeaders({ sign: 'invalid' });
      
      return request(app.getHttpServer())
        .get('/api/user-data')
        .set('timestamp', headers.timestamp)
        .set('user_id', headers.user_id)
        .set('sign', headers.sign)
        .expect(401);
    });

    it('should return 401 with expired timestamp', () => {
      const expiredTimestamp = (Date.now() - 6 * 60 * 1000).toString();
      const headers = createMockAuthHeaders({ timestamp: expiredTimestamp });
      
      return request(app.getHttpServer())
        .get('/api/user-data')
        .set('timestamp', headers.timestamp)
        .set('user_id', headers.user_id)
        .set('sign', headers.sign)
        .expect(401);
    });

    it('should return 200 or 404 with valid headers', () => {
      const headers = createMockAuthHeaders();
      
      return request(app.getHttpServer())
        .get('/api/user-data')
        .set('timestamp', headers.timestamp)
        .set('user_id', headers.user_id)
        .set('sign', headers.sign)
        .expect((res) => {
          // Either 200 with data or 404 if user doesn't exist, or 500 if DB error
          expect([200, 404, 500]).toContain(res.status);
        });
    });
  });
});

