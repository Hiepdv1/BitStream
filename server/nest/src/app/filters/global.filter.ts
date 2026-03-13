import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'src/infrastructure/logger/logger.module';
import { HttpExceptionFilter } from './http-exception.filter';

@Module({
  imports: [LoggerModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class GlobalFilterModule {}
