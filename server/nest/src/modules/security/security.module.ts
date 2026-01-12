import { Module } from '@nestjs/common';
import { TokenProviderModule } from './token-providers/token-provider.module';
import { JwtSecurityModule } from './jwt/jwt.module';

@Module({
  imports: [TokenProviderModule, JwtSecurityModule],
  exports: [TokenProviderModule, JwtSecurityModule],
})
export class SecurityModule {}
