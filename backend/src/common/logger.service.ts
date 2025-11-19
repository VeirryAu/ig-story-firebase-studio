import { Injectable, LoggerService } from '@nestjs/common';

export interface LogContext {
  userId?: number;
  requestId?: string;
  method?: string;
  path?: string;
  [key: string]: any;
}

@Injectable()
export class AppLogger implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string, ...args: any[]) {
    const ctx = context || this.context || 'App';
    console.log(`[${new Date().toISOString()}] [${ctx}] ${message}`, ...args);
  }

  error(message: string, trace?: string, context?: string, ...args: any[]) {
    const ctx = context || this.context || 'App';
    const errorLog = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      context: ctx,
      message,
      trace,
      ...args[0], // Additional context
    };
    console.error(JSON.stringify(errorLog, null, 2));
  }

  warn(message: string, context?: string, ...args: any[]) {
    const ctx = context || this.context || 'App';
    console.warn(`[${new Date().toISOString()}] [${ctx}] WARN: ${message}`, ...args);
  }

  debug(message: string, context?: string, ...args: any[]) {
    const ctx = context || this.context || 'App';
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${new Date().toISOString()}] [${ctx}] DEBUG: ${message}`, ...args);
    }
  }

  verbose(message: string, context?: string, ...args: any[]) {
    const ctx = context || this.context || 'App';
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${new Date().toISOString()}] [${ctx}] VERBOSE: ${message}`, ...args);
    }
  }

  /**
   * Log error with structured context
   */
  logError(
    error: Error | string,
    context: LogContext = {},
    trace?: string,
  ) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : trace;
    
    const errorLog = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      context: this.context || 'App',
      message: errorMessage,
      stack: errorStack,
      ...context,
    };

    console.error(JSON.stringify(errorLog, null, 2));
  }

  /**
   * Log warning with structured context
   */
  logWarning(message: string, context: LogContext = {}) {
    const warningLog = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      context: this.context || 'App',
      message,
      ...context,
    };

    console.warn(JSON.stringify(warningLog, null, 2));
  }
}

