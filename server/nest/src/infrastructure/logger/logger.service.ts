import { Injectable } from '@nestjs/common';
import { createLogger, level, Logger } from 'winston';
import { jsonLogFormat } from './logger.format';
import { errorFileTransport, combinedFileTransport } from './transports';
import { SystemLog } from './logger.types';

@Injectable()
export class LoggerService {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: jsonLogFormat,
      transports: [errorFileTransport, combinedFileTransport],
    });
  }

  error(log: Omit<SystemLog, 'level'>): void {
    const { message, ...rest } = log;
    this.logger.error(message, {
      ...rest,
      level: 'error',
    });
  }

  warn(log: Omit<SystemLog, 'level'>): void {
    const { message, ...rest } = log;
    this.logger.warn(message, {
      ...rest,
      level: 'warn',
    });
  }

  info(log: Omit<SystemLog, 'level'>): void {
    const { message, ...rest } = log;
    this.logger.info(message, {
      ...rest,
      level: 'info',
    });
  }
}
