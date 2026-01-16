import { Session } from "next-auth";

export interface AuthTokenResult {
  token: string | null;
  provider: string;
}

export function getAuthToken(session: Session | null): AuthTokenResult | null {
  if (!session) return null;

  const { accessToken, idToken, provider } = session;

  if (!provider) return null;

  const providerKey = provider.toLowerCase();

  let token = null;

  switch (providerKey) {
    case "google":
      token = idToken || accessToken || null;
      break;
    case "discord":
      token = accessToken || null;
      break;
    case "credentials":
      token = accessToken || null;
      break;
    default:
      token = accessToken || idToken || null;
  }

  return {
    token,
    provider: provider.toUpperCase(),
  };
}
