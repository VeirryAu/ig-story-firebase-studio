import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AppLogger } from './logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new AppLogger();

  constructor() {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, headers } = request;
    const requestId = headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userId = headers['user_id'] || 'unknown';

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const status = response.statusCode;

          // Log slow requests
          if (duration > 1000) {
            this.logger.logWarning('Slow HTTP request', {
              userId,
              requestId,
              method,
              path: url,
              statusCode: status,
              duration,
            });
          }

          // Log errors (4xx, 5xx)
          if (status >= 400) {
            this.logger.logWarning('HTTP error response', {
              userId,
              requestId,
              method,
              path: url,
              statusCode: status,
              duration,
            });
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const status = error.status || 500;

          this.logger.logError(
            error instanceof Error ? error : new Error(String(error)),
            {
              userId,
              requestId,
              method,
              path: url,
              statusCode: status,
              duration,
              errorType: error instanceof Error ? error.constructor.name : 'Unknown',
            },
            error instanceof Error ? error.stack : undefined,
          );
        },
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.logError(
          error instanceof Error ? error : new Error(String(error)),
          {
            userId,
            requestId,
            method,
            path: url,
            duration,
            stage: 'response',
          },
          error instanceof Error ? error.stack : undefined,
        );
        return throwError(() => error);
      }),
    );
  }
}

