import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
} from '@nestjs/common';
import type { Request } from 'express';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from 'src/infrastructure/logger/logger.service';

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      catchError((error: unknown) => {
        const isHttpException = error instanceof HttpException;

        const statusCode = isHttpException ? error.getStatus() : 500;

        if (statusCode >= 500) {
          const err = error instanceof Error ? error : undefined;

          this.logger.error({
            message: 'Request failed',
            service: 'api',
            timestamp: new Date().toISOString(),
            error: err
              ? {
                  name: err.name,
                  message: err.message,
                  stack: err.stack,
                }
              : {
                  name: 'UnknownError',
                  message: 'Non-error thrown',
                },
            request: {
              method: req.method,
              path: req.url,
              ip: req.ip,
              userAgent: req.headers['user-agent'],
            },
          });
        }

        return throwError(() => error);
      }),
    );
  }
}
