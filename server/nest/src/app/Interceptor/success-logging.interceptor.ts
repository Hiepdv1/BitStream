import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { tap } from 'rxjs';
import { SLOW_REQUEST_THRESHOLD_MS } from 'src/common/constants/performance.constants';
import { LoggerService } from 'src/infrastructure/logger/logger.service';

@Injectable()
export class SuccessLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest<Request>();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;

        if (duration < SLOW_REQUEST_THRESHOLD_MS) {
          return;
        }

        this.logger.info({
          message: 'Slow request detected',
          service: 'api',
          timestamp: new Date().toISOString(),
          context: 'http',
          request: {
            method: req.method,
            path: req.url,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
          },
          performance: {
            duration,
            threshold: SLOW_REQUEST_THRESHOLD_MS,
          },
        });
      }),
    );
  }
}
