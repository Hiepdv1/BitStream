import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'src/infrastructure/logger/logger.module';
import { ErrorLoggingInterceptor } from './error-logging.interceptor';
import { SuccessLoggingInterceptor } from './success-logging.interceptor';

@Module({
  imports: [LoggerModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessLoggingInterceptor,
    },
  ],
})
export class InterceptorModule {}
