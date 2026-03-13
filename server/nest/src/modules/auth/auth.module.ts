import { Module } from '@nestjs/common';
import { ProviderTokenGuard } from './guards/provider-token.guard';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [SecurityModule],
  controllers: [AuthController],
  providers: [ProviderTokenGuard, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
