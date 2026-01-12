import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { SignatureService } from './signature.service';
import { SignatureGuard } from './signature.guard';

@Module({
  imports: [RedisModule],
  providers: [
    SignatureService,
    {
      provide: APP_GUARD,
      useClass: SignatureGuard,
    },
  ],
})
export class SignatureModule {}
