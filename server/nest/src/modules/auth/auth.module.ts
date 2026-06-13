import { Module } from '@nestjs/common';
import { ProviderTokenGuard } from './guards/provider-token.guard';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { SecurityModule } from '../security/security.module';
import { SignatureModule } from 'src/app/guards/signature/signature.module';

@Module({
  imports: [SecurityModule, SignatureModule],
  controllers: [AuthController],
  providers: [ProviderTokenGuard, AuthService],
  exports: [AuthService, ProviderTokenGuard, SecurityModule],
})
export class AuthModule {}
