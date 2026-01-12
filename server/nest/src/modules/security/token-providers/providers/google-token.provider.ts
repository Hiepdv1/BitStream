import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { SocialAuth, TokenVerifier } from './token-verifier.interface';
import { ProviderType } from 'src/generated/prisma/enums';

@Injectable()
export class GoogleTokenProvider implements TokenVerifier {
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async verify(token: string): Promise<SocialAuth> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload?.email || !payload?.name)
        throw new UnauthorizedException('Invalid Google token');

      return {
        email: payload.email,
        provider: ProviderType.GOOGLE,
        name: payload?.name,
        avatar: payload?.picture || '',
      };
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
