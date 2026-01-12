import { Logo } from "@/components/brand";
import React from "react";
import Link from "next/link";
// Removed Film import

export default function VerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 cinema-bg relative">
      <div className="film-grain"></div>
      <div className="spotlight-3 opacity-30"></div>
      <div className="cinema-vignette opacity-80"></div>

      <div className="cinema-content w-full max-w-lg">
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
