export interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

export interface FormFieldError {
  field: string;
  message: string;
}

export type PasswordStrength = "weak" | "medium" | "strong" | "very-strong";

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number;
  feedback: string;
}

export type AuthProvider = "GOOGLE" | "DISCORD" | "CREDENTIALS";

export interface AuthIdentity {
  provider: AuthProvider;
  token: string | null;
}

export interface AuthTokenPayload {
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

export interface AuthStatus {
  sub: string;
  isVerified: boolean;
  role: number;
  sid: string;
  email: string;
  jti: string;
  type: string;
  iat: number;
  exp: number;
}

export interface ResendVerificationEmailResponse {
  remainingSeconds: number;
  message: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  bio: string | null;
  role: number;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
