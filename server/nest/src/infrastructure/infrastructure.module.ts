import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { CorsModule } from './cors/cors.module';
import { DatabaseModule } from './database/database.module';
import { CookieModule } from './cookie/cookie.module';
import { KafkaModule } from './kafka/kafka.module';
import { MinioModule } from './minio/minio.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),
    CookieModule,
    RedisModule,
    CorsModule,
    DatabaseModule,
    KafkaModule,
    MinioModule,
  ],
})
export class InfrastructureModule {}
