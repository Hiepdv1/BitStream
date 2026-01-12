import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JWT_CONFIG } from '../configs/jwt.config';
import {
  BaseJwtPayload,
  DecodedJwtPayload,
  JwtTokenType,
} from '../types/jwt.type';
import crypto from 'crypto';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwt: NestJwtService) {}

  sign<T extends object>(type: JwtTokenType, payload: T) {
    const config = JWT_CONFIG[type];
    const jti = crypto.randomUUID();

    const token = this.jwt.sign(
      {
        ...payload,
        jti,
        type,
      },
      {
        secret: config.secret,
        expiresIn: config.expiresInSec,
      },
    );

    const expiresAt = Math.ceil(Date.now() / 1000) + config.expiresInSec;

    return {
      token,
      jti,
      type,
      expiresAt,
      expiresIn: config.expiresInSec,
    };
  }

  verify<T = any>(type: JwtTokenType, token: string): T & DecodedJwtPayload {
    const config = JWT_CONFIG[type];
    try {
      return this.jwt.verify(token, {
        secret: config.secret,
      }) as T & DecodedJwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  decode<T = any>(token: string): T | null {
    return this.jwt.decode(token) as T | null;
  }
}
