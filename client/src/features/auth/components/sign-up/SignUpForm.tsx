"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SocialAuthButtons } from "../shared/SocialAuthButtons";
import { AuthDivider } from "../shared/AuthDivider";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { UI_TEXT } from "../../constants/ui";
import { signUpSchema, type SignUpFormData } from "../../schemas";
import { extractApiError } from "@/lib/http/extractApiError";
import { useRegister } from "../../hooks/useAuth";

export function SignUpForm() {
  const { mutate: registerUser, isPending: isLoading } = useRegister();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const onSubmit = (data: SignUpFormData) => {
    setSubmitError(null);
    registerUser(data, {
      onError: (error) => {
        const apiError = extractApiError(error);

        if (apiError.fieldErrors) {
          Object.entries(apiError.fieldErrors).forEach(([field, messages]) => {
            setError(field as any, {
              type: "server",
              message: messages[0],
            });
          });
          return;
        }

        setSubmitError(apiError.message);
      },
    });
  };

  const text = UI_TEXT.auth.signUp;

  return (
    <>
      <SocialAuthButtons />
      <AuthDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          id="signup-fullname"
          type="text"
          label={text.fullNameLabel}
          placeholder="John Doe"
          error={errors.fullName?.message}
          required
          autoComplete="name"
          {...register("fullName")}
        />

        <Input
          id="signup-email"
          type="email"
          label={text.emailLabel}
          placeholder="your.email@example.com"
          error={errors.email?.message}
          required
          autoComplete="email"
          {...register("email")}
        />

        <div>
          <Input
            id="signup-password"
            type="password"
            label={text.passwordLabel}
            placeholder="••••••••"
            error={errors.password?.message}
            required
            autoComplete="new-password"
            {...register("password")}
          />
          <PasswordStrengthIndicator
            password={passwordValue}
            show={passwordValue.length > 0}
          />
        </div>

        <Input
          id="signup-confirm-password"
          type="password"
          label={text.confirmPasswordLabel}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          required
          autoComplete="new-password"
          {...register("confirmPassword")}
        />

        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="mt-0.5 w-5 h-5 rounded border-2 border-white/20 bg-white/5 text-purple-500 focus:ring-2 focus:ring-brand focus:ring-offset-0 focus:ring-offset-black transition-all cursor-pointer"
              {...register("acceptTerms")}
            />
            <span className="text-sm text-text-muted group-hover:text-text-main transition-colors">
              {text.termsPrefix}{" "}
              <Link
                href="/terms"
                className="text-brand hover:text-brand-hover transition-colors underline"
                onClick={(e) => e.stopPropagation()}
              >
                {text.termsLink}
              </Link>{" "}
              {text.and}{" "}
              <Link
                href="/privacy"
                className="text-brand hover:text-brand-hover transition-colors underline"
                onClick={(e) => e.stopPropagation()}
              >
                {text.privacyLink}
              </Link>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-error text-xs sm:text-sm ml-8 animate-shake">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        {submitError && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-center">
            <p className="text-error text-sm">{submitError}</p>
          </div>
        )}

        <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
          {text.submitButton}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-text-muted">
        {text.hasAccount}{" "}
        <Link
          href="/sign-in"
          className="text-brand hover:text-brand-hover font-semibold transition-colors hover:underline"
        >
          {text.signInLink}
        </Link>
      </div>
    </>
  );
}
