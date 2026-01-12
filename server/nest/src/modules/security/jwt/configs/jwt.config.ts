import { JwtTokenType } from '../types/jwt.type';

export interface JwtTokenConfig {
  secret: string;
  expiresInSec: number;
}

export const JWT_CONFIG: Record<JwtTokenType, JwtTokenConfig> = {
  [JwtTokenType.ACCESS]: {
    secret: process.env.JWT_ACCESS_SECRET!,
    expiresInSec: 15 * 60,
  },

  [JwtTokenType.REFRESH]: {
    secret: process.env.JWT_REFRESH_SECRET!,
    expiresInSec: 7 * 24 * 60 * 60,
  },

  [JwtTokenType.STREAM]: {
    secret: process.env.JWT_STREAM_SECRET!,
    expiresInSec: 2 * 60 * 60,
  },

  [JwtTokenType.INTERNAL]: {
    secret: process.env.JWT_INTERNAL_SECRET!,
    expiresInSec: 5 * 60,
  },

  [JwtTokenType.VERIFY_EMAIL]: {
    secret: process.env.JWT_VERIFY_EMAIL_SECRET!,
    expiresInSec: 1 * 60 * 60,
  },
};
