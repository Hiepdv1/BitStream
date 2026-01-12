import { SignUpForm } from "@/features/auth/components";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Streaming App",
  description:
    "Create your free streaming account to access exclusive content and personalized recommendations.",
  keywords: ["sign up", "register", "create account", "streaming", "join"],
  openGraph: {
    title: "Sign Up - Streaming App",
    description: "Create your streaming account today",
    type: "website",
  },
};

export default function SignUpPage() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Create Account
        </h1>
        <p className="text-sm text-gray-400">
          Start your journey with us today
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
        <SignUpForm />
      </div>

      <p className="px-8 text-center text-xs text-gray-500">
        By clicking create account, you agree to our{" "}
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
