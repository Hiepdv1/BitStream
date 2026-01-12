import { Session } from "next-auth";

export interface AuthTokenResult {
  token: string | null;
  provider: string;
}

export function getAuthToken(session: Session | null): AuthTokenResult | null {
  if (!session) return null;

  const { accessToken, idToken, provider } = session;

  if (!provider) return null;

  // Normalize provider string
  const providerKey = provider.toLowerCase();

  let token = null;

  switch (providerKey) {
    case "google":
      // Google uses idToken for verification in this system
      token = idToken || accessToken || null;
      break;
    case "discord":
      // Discord typically uses accessToken
      token = accessToken || null;
      break;
    case "credentials":
      // Local login uses accessToken (JWT from backend)
      token = accessToken || null;
      break;
    default:
      // Fallback
      token = accessToken || idToken || null;
  }

  return {
    token,
    provider: provider.toUpperCase(), // Backend expects uppercase usually? Checking usages.
  };
}
