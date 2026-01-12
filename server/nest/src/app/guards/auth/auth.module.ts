import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/modules/security/jwt/guards/jwt.guard';
import { SecurityModule } from 'src/modules/security/security.module';
import { GlobalAuthGuard } from './auth.guard';

@Module({
  imports: [SecurityModule],
  providers: [
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
  ],
})
export class AuthModule {}
