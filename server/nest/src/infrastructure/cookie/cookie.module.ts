import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import cookieParser from 'cookie-parser';

@Module({})
export class CookieModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
