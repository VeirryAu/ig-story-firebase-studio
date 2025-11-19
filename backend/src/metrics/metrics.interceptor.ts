import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, route } = request;
    const routePath = route?.path || request.url;

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const status = response.statusCode;

          // Record metrics
          this.metricsService.httpRequestDuration
            .labels(method, routePath, status)
            .observe(duration);

          this.metricsService.httpRequestTotal
            .labels(method, routePath, status)
            .inc();

          if (status >= 400) {
            this.metricsService.httpRequestErrors
              .labels(method, routePath, 'http_error')
              .inc();
          }
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          const status = error.status || 500;

          this.metricsService.httpRequestDuration
            .labels(method, routePath, status)
            .observe(duration);

          this.metricsService.httpRequestTotal
            .labels(method, routePath, status)
            .inc();

          this.metricsService.httpRequestErrors
            .labels(method, routePath, error.name || 'unknown')
            .inc();
        },
      }),
    );
  }
}

