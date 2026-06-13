import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWT_CONFIG } from '../configs/jwt.config';
import { JwtTokenType } from '../types/jwt.type';
import { cookieJwtExtractor } from '../extractors/cookie-jwt.extractor';
import { AuthPayload } from 'src/modules/auth/types/auth';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { RedisKeyManager } from 'src/infrastructure/redis/redis-key.manager';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-auth') {
  constructor(private readonly redisService: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieJwtExtractor,
      ]),
      secretOrKeyProvider: (_, rawJwt, done) => {
        try {
          const decoded: any = JSON.parse(
            Buffer.from(rawJwt.split('.')[1], 'base64').toString(),
          );

          const config = JWT_CONFIG[decoded.type as JwtTokenType];
          if (!config) return done(new UnauthorizedException(), '');

          done(null, config.secret);
        } catch {
          done(new UnauthorizedException(), '');
        }
      },
    });
  }

  async validate(payload: AuthPayload) {
    if (!payload || !payload.sub || payload.type !== JwtTokenType.ACCESS) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const isBlacklisted = await this.redisService.get(
      RedisKeyManager.getBlacklistKey(payload.jti),
    );

    if (isBlacklisted) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return payload;
  }
}
