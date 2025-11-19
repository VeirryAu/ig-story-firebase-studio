import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from './logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new AppLogger();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
        ? exception.message
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'string' ? message : (message as any).message || message,
      error: exception instanceof HttpException ? exception.name : 'Error',
    };

    // Log error with full context
    const errorContext = {
      userId: request.headers['user_id'] as string,
      requestId: request.headers['x-request-id'] as string || 'unknown',
      method: request.method,
      path: request.url,
      statusCode: status,
      headers: {
        timestamp: request.headers['timestamp'],
        user_id: request.headers['user_id'],
      },
      body: request.body,
      query: request.query,
    };

    if (exception instanceof Error) {
      this.logger.logError(exception, errorContext, exception.stack);
    } else {
      this.logger.logError(
        typeof message === 'string' ? message : JSON.stringify(message),
        errorContext,
      );
    }

    // Don't expose internal errors in production
    if (status === HttpStatus.INTERNAL_SERVER_ERROR && process.env.NODE_ENV === 'production') {
      errorResponse.message = 'Internal server error';
    }

    response.status(status).json(errorResponse);
  }
}

