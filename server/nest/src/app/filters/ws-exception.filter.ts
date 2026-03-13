import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WsBaseException } from 'src/common/exceptions/ws-exception';
import { LoggerService } from 'src/infrastructure/logger/logger.service';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient<Socket>();
    const data = ctx.getData();

    let status = 500;
    let message = 'Internal server error';
    let errors: any = null;
    let isInternal = true;

    if (exception instanceof WsBaseException) {
      const payload = exception.getError() as any;

      status = payload.status ?? 500;
      message = payload.message ?? message;
      errors = payload.errors ?? null;

      isInternal = status >= 500;
    } else if (exception instanceof WsException) {
      const error = exception.getError();

      if (typeof error === 'string') {
        status = 400;
        message = error;
        isInternal = false;
      } else if (typeof error === 'object') {
        status = error['status'] ?? 400;
        message = error['message'] ?? 'Error';
        errors = error['errors'] ?? null;
        isInternal = status >= 500;
      } else {
        isInternal = true;
      }
    } else {
      isInternal = true;
    }

    if (isInternal) {
      this.logger.error({
        message: 'Unhandled WS internal error',
        service: 'ws',
        timestamp: new Date().toISOString(),
        error: {
          name: exception instanceof Error ? exception.name : 'Unknown',
          message:
            exception instanceof Error
              ? exception.message
              : JSON.stringify(exception),
          stack: exception instanceof Error ? exception.stack : undefined,
        },
      });

      status = 500;
      message = 'Internal server error';
      errors = null;
    }

    client.emit('exception', {
      success: false,
      status,
      message,
      errors,
    });
  }
}
