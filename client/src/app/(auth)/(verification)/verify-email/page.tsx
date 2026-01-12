import { VerifyEmailNotification } from "@/features/auth/components";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Your Email - Streaming App",
  description:
    "Check your email inbox for a verification link to complete your account registration.",
  keywords: ["verify email", "email verification", "account activation"],
  openGraph: {
    title: "Verify Your Email - Streaming App",
    description: "Check your email to verify your account",
    type: "website",
  },
};

export default function VerifyEmailPage() {
  return <VerifyEmailNotification />;
}
