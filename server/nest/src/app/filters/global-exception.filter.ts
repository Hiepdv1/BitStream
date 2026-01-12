import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Fail } from 'src/common/response/response.helper';
import { LoggerService } from 'src/infrastructure/logger/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    if (status >= 500) {
      this.logger.error({
        message: 'Unhandled system error',
        service: 'api',
        timestamp: new Date().toISOString(),
        error: {
          name: exception instanceof Error ? exception.name : 'Unknown',
          message:
            exception instanceof Error ? exception.message : 'Unknown error',
          stack: exception instanceof Error ? exception.stack : undefined,
        },
        request: {
          method: req.method,
          path: req.url,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });
    }

    const response =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const message =
      typeof response === 'string'
        ? response
        : (response['message'] ?? 'Error');

    const errors =
      typeof response === 'object' ? (response['errors'] ?? null) : null;

    res.status(status).json(Fail(message, errors));
  }
}
