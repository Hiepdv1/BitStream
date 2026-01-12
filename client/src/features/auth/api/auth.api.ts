import { AuthTokenPayload, AuthStatus } from "../types/auth";
import { SignInFormData, SignUpFormData } from "../schemas";
import { httpRequest } from "@/lib/http/client/http-client";

export const login = async (data: SignInFormData) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: "Logged in" };
};

export const register = async (data: SignUpFormData) => {
  const response = await httpRequest<AuthTokenPayload>({
    url: "/proxy/external-auth/sign-up",
    method: "POST",
    data: {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      acceptTerms: data.acceptTerms,
    },
  });
  return response.data;
};

export const verifyEmail = async (token: string) => {
  const response = await httpRequest<AuthTokenPayload>({
    url: "/proxy/external-auth/verify-email",
    method: "POST",
    data: { token },
  });
  return response.data;
};

export const getAuthStatus = async () => {
  const response = await httpRequest<AuthStatus>({
    url: "/auth/status",
  });
  return response.data;
};

export const logout = async () => {};
