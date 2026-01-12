"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SocialAuthButtons } from "../shared/SocialAuthButtons";
import { AuthDivider } from "../shared/AuthDivider";
import { UI_TEXT } from "../../constants/ui";
import { signInSchema, type SignInFormData } from "../../schemas";
import { useLogin } from "../../hooks/useAuth";

export function SignInForm() {
  const { mutate: login, isPending: isLoading } = useLogin();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignInFormData) => {
    setSubmitError(null);
    login(data, {
      onError: (error) => {
        console.error("Sign in error:", error);
        setSubmitError("Please use Social Login (Google/Facebook) for now.");
      },
    });
  };

  const text = UI_TEXT.auth.signIn;

  return (
    <>
      <SocialAuthButtons />
      <AuthDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          id="signin-email"
          type="email"
          label={text.emailLabel}
          placeholder="your.email@example.com"
          error={errors.email?.message}
          required
          autoComplete="email"
          {...register("email")}
        />

        <Input
          id="signin-password"
          type="password"
          label={text.passwordLabel}
          placeholder="••••••••"
          error={errors.password?.message}
          required
          autoComplete="current-password"
          {...register("password")}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-brand hover:text-brand-hover transition-colors hover:underline"
          >
            {text.forgotPassword}
          </Link>
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
        {text.noAccount}{" "}
        <Link
          href="/sign-up"
          className="text-brand hover:text-brand-hover font-semibold transition-colors hover:underline"
        >
          {text.signUpLink}
        </Link>
      </div>
    </>
  );
}
