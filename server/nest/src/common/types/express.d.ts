import 'express';
import { AuthPayload } from 'src/modules/auth/types/auth';
import { SocialAuth } from 'src/modules/security/token-providers/providers/token-verifier.interface';

declare global {
  namespace Express {
    interface Request {
      /**
       * Set by JwtAuthGuard (via JWT strategy) for all normal authenticated requests.
       * Always AccessTokenPayload — the server-issued JWT decoded payload.
       */
      payload?: AuthPayload;
      /**
       * Set ONLY by ProviderTokenGuard on the /auth/sign-in/social endpoint.
       * Contains the verified identity from Google/Discord for the ONE-TIME sign-in step.
       * After sign-in, server JWTs are issued and all subsequent auth uses req.payload.
       */
      auth?: SocialAuth;
      cookies?: Record<string, string> & {
        access_token?: string;
        refresh_token?: string;
        auth_provider?: string;
      };
    }
  }
}

declare module 'socket.io' {
  interface Socket {
    auth?: AuthPayload;
    currentRoom?: string;
  }
}
