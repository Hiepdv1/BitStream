import { Module } from '@nestjs/common';
import { TokenProviderFactory } from './token-provider.factory';
import { GoogleTokenProvider } from './providers/google-token.provider';
import { DiscordTokenProvider } from './providers/discord-token.provider';

@Module({
  providers: [TokenProviderFactory, GoogleTokenProvider, DiscordTokenProvider],
  exports: [TokenProviderFactory, GoogleTokenProvider, DiscordTokenProvider],
})
export class TokenProviderModule {}
