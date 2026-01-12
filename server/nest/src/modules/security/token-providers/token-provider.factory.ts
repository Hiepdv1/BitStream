import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GoogleTokenProvider } from './providers/google-token.provider';
import { DiscordTokenProvider } from './providers/discord-token.provider';
import { ProviderType } from 'src/generated/prisma/enums';

@Injectable()
export class TokenProviderFactory {
  constructor(
    private readonly google: GoogleTokenProvider,
    private readonly discord: DiscordTokenProvider,
  ) {}

  get(provider: string) {
    switch (provider) {
      case ProviderType.GOOGLE:
        return this.google;
      case ProviderType.DISCORD:
        return this.discord;
      default:
        throw new UnauthorizedException('Unsupported provider');
    }
  }
}
