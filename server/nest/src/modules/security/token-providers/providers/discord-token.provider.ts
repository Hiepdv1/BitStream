import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { SocialAuth, TokenVerifier } from './token-verifier.interface';
import { ProviderType } from 'src/generated/prisma/enums';

@Injectable()
export class DiscordTokenProvider implements TokenVerifier {
  async verify(token: string): Promise<SocialAuth> {
    try {
      const res = await axios.get('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (
        !res.data?.id &&
        !res.data?.email &&
        (!res.data?.global_name || !res.data?.username)
      )
        throw new UnauthorizedException('Invalid Discord token');

      return {
        avatar: res.data?.avatar || '',
        email: res.data.email,
        provider: ProviderType.DISCORD,
        name: res.data.global_name || res.data.username,
      };
    } catch {
      throw new UnauthorizedException('Invalid Discord token');
    }
  }
}
