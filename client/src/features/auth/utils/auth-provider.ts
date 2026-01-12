import { Session } from "next-auth";
import { PROVIDER_TYPES } from "../enum";
import { AuthIdentity, AuthProvider } from "../types/auth";

export const getAuthProvider = (
  session: Session | null | undefined
): AuthProvider => {
  const rawProvider = session?.provider?.toUpperCase();

  if (rawProvider === PROVIDER_TYPES.GOOGLE) return PROVIDER_TYPES.GOOGLE;
  if (rawProvider === PROVIDER_TYPES.DISCORD) return PROVIDER_TYPES.DISCORD;

  return PROVIDER_TYPES.CREDENTIALS;
};

export const getAuthIdentity = (
  session: Session | null | undefined
): AuthIdentity => {
  const provider = getAuthProvider(session);

  const token =
    provider === PROVIDER_TYPES.GOOGLE
      ? session?.idToken
      : session?.accessToken;

  return {
    provider,
    token: token || null,
  };
};
