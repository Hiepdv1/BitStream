import { SignInForm } from "@/features/auth/components";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Streaming App",
  description:
    "Sign in to your streaming account to access your personalized content and continue watching.",
  keywords: ["sign in", "login", "streaming", "account access"],
  openGraph: {
    title: "Sign In - Streaming App",
    description: "Access your streaming account",
    type: "website",
  },
};

export default function SignInPage() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome Back
        </h1>
        <p className="text-sm text-gray-400">
          Sign in to continue your experience
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
        <SignInForm />
      </div>

      <p className="px-8 text-center text-xs text-gray-500">
        By clicking continue, you agree to our{" "}
        <a
          href="/terms"
          className="underline hover:text-white transition-colors"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          className="underline hover:text-white transition-colors"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
