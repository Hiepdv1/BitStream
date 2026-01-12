export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  PASSWORD_TOO_SHORT: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  PASSWORD_MISMATCH: "Passwords do not match",
  TERMS_REQUIRED: "You must accept the terms and conditions",
  AUTH_FAILED: "Invalid email or password",
  EMAIL_TAKEN: "This email is already in use",
} as const;

export const SUCCESS_MESSAGES = {
  SIGN_IN: "Successfully signed in!",
  SIGN_UP: "Account created successfully!",
  PASSWORD_RESET: "Password reset link sent to your email",
} as const;
