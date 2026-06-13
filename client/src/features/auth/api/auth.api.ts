import {
  AuthTokenPayload,
  AuthStatus,
  ResendVerificationEmailResponse,
  UserProfile,
} from "../types/auth";
import { SignInFormData, SignUpFormData } from "../schemas";
import { httpRequest } from "@/lib/http/client/http-client";
import { setAuthExpiries, clearAuthExpiries } from "@/lib/auth/tokenUtils";

export const login = async (data: SignInFormData) => {
  const response = await httpRequest<AuthTokenPayload>({
    url: "/auth/sign-in/credentials",
    method: "POST",
    data: {
      email: data.email,
      password: data.password,
    },
  });

  return response.data;
};

export const register = async (data: SignUpFormData) => {
  const response = await httpRequest<AuthTokenPayload>({
    url: "/auth/sign-up",
    method: "POST",
    data: {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    },
  });

  const payload = response.data;
  if (
    payload &&
    payload.accessTokenExpiresAt &&
    payload.refreshTokenExpiresAt
  ) {
    setAuthExpiries(
      payload.accessTokenExpiresAt,
      payload.refreshTokenExpiresAt,
    );
  }
  return response.data;
};

export const verifyEmail = async (token: string) => {
  const response = await httpRequest<AuthTokenPayload>({
    url: "/auth/verify-email",
    method: "POST",
    data: { token },
  });

  const payload = response.data;
  if (
    payload &&
    payload.accessTokenExpiresAt &&
    payload.refreshTokenExpiresAt
  ) {
    setAuthExpiries(
      payload.accessTokenExpiresAt,
      payload.refreshTokenExpiresAt,
    );
  }
  return response.data;
};

export const resendVerificationEmail = async () => {
  const response = await httpRequest<ResendVerificationEmailResponse>({
    url: "/auth/resend-verification-email",
    method: "POST",
  });

  return response.data;
};

export const getAuthStatus = async () => {
  const response = await httpRequest<AuthStatus>({
    url: "/auth/status",
  });

  return response.data;
};

export const getProfile = async () => {
  try {
    const response = await httpRequest<UserProfile>({
      url: "/user/me",
      method: "GET",
    });
    return response.data;
  } catch {
    return null;
  }
};

export const logout = async () => {
  const res = await httpRequest({
    url: "/auth/logout",
    method: "POST",
  });

  return res.data;
};
