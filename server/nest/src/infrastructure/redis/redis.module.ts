import { Module } from '@nestjs/common';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { RedisService } from './redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DEFAULT_REDIS_TTL_SECONDS } from './redis.constant';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<CacheModuleOptions> => {
        const store: unknown = await redisStore({
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
          password: configService.get<string>('REDIS_PASSWORD') || '',
          ttl: DEFAULT_REDIS_TTL_SECONDS,
        });

        return {
          store: store,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService],
  exports: [RedisService, CacheModule],
})
export class RedisModule {}
