import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Histogram, Gauge, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private register: Registry;

  // HTTP Metrics
  public httpRequestDuration: Histogram<string>;
  public httpRequestTotal: Counter<string>;
  public httpRequestErrors: Counter<string>;

  // Database Metrics
  public dbQueryDuration: Histogram<string>;
  public dbConnectionPoolSize: Gauge<string>;
  public dbConnectionPoolActive: Gauge<string>;
  public dbConnectionPoolIdle: Gauge<string>;

  // Cache Metrics
  public cacheHits: Counter<string>;
  public cacheMisses: Counter<string>;
  public cacheOperations: Histogram<string>;

  // Business Metrics
  public activeUsers: Gauge<string>;
  public apiResponseTime: Histogram<string>;

  constructor() {
    this.register = new Registry();
    collectDefaultMetrics({ register: this.register });

    // HTTP Metrics
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });

    this.httpRequestErrors = new Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_type'],
      registers: [this.register],
    });

    // Database Metrics
    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['query_type', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.register],
    });

    this.dbConnectionPoolSize = new Gauge({
      name: 'db_connection_pool_size',
      help: 'Total size of database connection pool',
      registers: [this.register],
    });

    this.dbConnectionPoolActive = new Gauge({
      name: 'db_connection_pool_active',
      help: 'Number of active database connections',
      registers: [this.register],
    });

    this.dbConnectionPoolIdle = new Gauge({
      name: 'db_connection_pool_idle',
      help: 'Number of idle database connections',
      registers: [this.register],
    });

    // Cache Metrics
    this.cacheHits = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type'],
      registers: [this.register],
    });

    this.cacheMisses = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_type'],
      registers: [this.register],
    });

    this.cacheOperations = new Histogram({
      name: 'cache_operation_duration_seconds',
      help: 'Duration of cache operations in seconds',
      labelNames: ['operation', 'cache_type'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1],
      registers: [this.register],
    });

    // Business Metrics
    this.activeUsers = new Gauge({
      name: 'active_users',
      help: 'Number of active users',
      registers: [this.register],
    });

    this.apiResponseTime = new Histogram({
      name: 'api_response_time_seconds',
      help: 'API response time in seconds',
      labelNames: ['endpoint'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });
  }

  async onModuleInit() {
    // Update connection pool metrics periodically
    setInterval(() => {
      this.updateConnectionPoolMetrics();
    }, 5000);
  }

  getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  getRegister(): Registry {
    return this.register;
  }

  private updateConnectionPoolMetrics() {
    // This will be called from database service
    // Placeholder for now
  }

  updateConnectionPool(size: number, active: number, idle: number) {
    this.dbConnectionPoolSize.set(size);
    this.dbConnectionPoolActive.set(active);
    this.dbConnectionPoolIdle.set(idle);
  }
}

