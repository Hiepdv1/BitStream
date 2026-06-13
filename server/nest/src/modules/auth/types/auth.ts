import { ProviderType } from 'src/generated/prisma/enums';
import {
  BaseJwtPayload,
  DecodedJwtPayload,
} from 'src/modules/security/jwt/types/jwt.type';

export interface AccessTokenPayload extends BaseJwtPayload {
  isVerified: boolean;
  role: number;
  sid: string;
  email: string;
  name: string;
  avatar: string;
  provider: ProviderType;
}

export type JwtFullPayload<T = object> = T & DecodedJwtPayload;

export type AuthPayload = JwtFullPayload<AccessTokenPayload>;

export interface RefreshTokenPayload extends BaseJwtPayload {
  sid: string;
  isVerified: boolean;
  provider: ProviderType;
}

export interface VerifyTokenPayload extends BaseJwtPayload {
  sid: string;
}
