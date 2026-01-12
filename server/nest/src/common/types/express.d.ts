import 'express';
import { AccessTokenPayload } from 'src/modules/auth/types/auth';
import { SocialAuth } from 'src/modules/security/token-providers/providers/token-verifier.interface';

declare global {
  namespace Express {
    interface Request {
      auth?: SocialAuth;
      payload?: AccessTokenPayload;
      cookies?: Record<string, string> & {
        access_token?: string;
        refresh_token?: string;
        auth_provider?: string;
      };
    }
  }
}
