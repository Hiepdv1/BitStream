import { Logo } from "@/components/brand";
import React from "react";
import Link from "next/link";

export default function VerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 relative bg-gray-50 dark:bg-background overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-h-[800px] opacity-40 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-b from-brand/20 to-transparent blur-3xl"></div>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand/10 dark:bg-brand/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <Link href="/" className="group hover:scale-105 transition-transform">
            <Logo className="w-12 h-12" textClassName="text-3xl" />
          </Link>
        </div>

        {children}

        <div className="mt-8 text-center space-x-4 text-sm text-gray-500">
          <Link
            href="/help"
            className="hover:text-purple-400 transition-colors"
          >
            Help Center
          </Link>
          <span>•</span>
          <Link
            href="/terms"
            className="hover:text-purple-400 transition-colors"
          >
            Terms
          </Link>
          <span>•</span>
          <Link
            href="/privacy"
            className="hover:text-purple-400 transition-colors"
          >
            Privacy
          </Link>
        </div>
      </div>
    </div>
  );
}
