import { Module } from '@nestjs/common';

import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { SignatureService } from './signature.service';
import { SignatureGuard } from './signature.guard';

@Module({
  imports: [RedisModule],
  providers: [SignatureService, SignatureGuard],
  exports: [SignatureService, SignatureGuard],
})
export class SignatureModule {}
