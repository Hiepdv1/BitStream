"use client";

import {
  calculatePasswordStrength,
  PASSWORD_STRENGTH_CONFIG,
} from "@/features/auth/utils/password";

interface PasswordStrengthIndicatorProps {
  password: string;
  show?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  show = true,
}: PasswordStrengthIndicatorProps) {
  if (!show || !password) return null;

  const { strength, score, feedback } = calculatePasswordStrength(password);
  const config = PASSWORD_STRENGTH_CONFIG[strength];
  const percentage = (score / 5) * 100;

  return (
    <div className="mt-3 space-y-2 animate-fade-in">
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${config.bgClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className={`font-semibold ${config.color}`}>{config.text}</span>
        <span className="text-text-muted">{feedback}</span>
      </div>
    </div>
  );
}
