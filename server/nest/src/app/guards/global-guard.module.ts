import { Module } from '@nestjs/common';
import { SignatureModule } from './signature/signature.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [RateLimitModule, SignatureModule, AuthModule],
})
export class GlobalGuardModule {}
