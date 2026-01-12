import { ProviderType } from 'src/generated/prisma/enums';

export type SocialAuth = {
  email: string;
  provider: ProviderType;
  name: string;
  avatar?: string;
};

export interface TokenVerifier {
  verify(token: string): Promise<SocialAuth>;
}
