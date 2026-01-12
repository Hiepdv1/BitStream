import { PasswordStrength, PasswordStrengthResult } from "../types/auth";
import { UI_TEXT } from "../constants/ui";

export const PASSWORD_STRENGTH_CONFIG: Record<
  PasswordStrength,
  { color: string; text: string; minScore: number; bgClass: string }
> = {
  weak: {
    color: "text-error",
    bgClass: "bg-error",
    text: UI_TEXT.passwordStrength.weak,
    minScore: 0,
  },
  medium: {
    color: "text-warning",
    bgClass: "bg-warning",
    text: UI_TEXT.passwordStrength.medium,
    minScore: 2,
  },
  strong: {
    color: "text-info",
    bgClass: "bg-info",
    text: UI_TEXT.passwordStrength.strong,
    minScore: 3,
  },
  "very-strong": {
    color: "text-success",
    bgClass: "bg-success",
    text: UI_TEXT.passwordStrength.veryStrong,
    minScore: 4,
  },
};

export function calculatePasswordStrength(
  password: string
): PasswordStrengthResult {
  if (!password) {
    return {
      strength: "weak",
      score: 0,
      feedback: UI_TEXT.passwordStrength.enterPassword,
    };
  }

  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push(UI_TEXT.passwordStrength.addUpperLower);
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push(UI_TEXT.passwordStrength.addNumber);
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push(UI_TEXT.passwordStrength.addSpecial);
  }

  let strength: PasswordStrength = "weak";
  if (score >= 4) strength = "very-strong";
  else if (score >= 3) strength = "strong";
  else if (score >= 2) strength = "medium";

  const feedbackText =
    feedback.length > 0
      ? `Add ${feedback.join(", ")} for stronger password`
      : UI_TEXT.passwordStrength.excellent;

  return {
    strength,
    score,
    feedback: feedbackText,
  };
}
