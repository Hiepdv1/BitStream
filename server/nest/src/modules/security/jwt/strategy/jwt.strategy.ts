import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWT_CONFIG } from '../configs/jwt.config';
import { JwtTokenType } from '../types/jwt.type';
import { cookieJwtExtractor } from '../extractors/cookie-jwt.extractor';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-auth') {
  constructor() {
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

  async validate(payload: any) {
    if (!payload || !payload?.sub) throw new UnauthorizedException();
    return payload;
  }
}
