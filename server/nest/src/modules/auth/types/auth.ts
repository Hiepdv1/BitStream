import { ProviderType } from 'src/generated/prisma/enums';
import { BaseJwtPayload } from 'src/modules/security/jwt/types/jwt.type';

export interface AccessTokenPayload extends BaseJwtPayload {
  isVerified: boolean;
  role: string;
  sid: string;
  email: string;
  provider: ProviderType;
}

export interface RefreshTokenPayload extends BaseJwtPayload {
  sid: string;
  isVerified: boolean;
  provider: ProviderType;
}

export interface VerifyTokenPayload extends BaseJwtPayload {
  sid: string;
}
