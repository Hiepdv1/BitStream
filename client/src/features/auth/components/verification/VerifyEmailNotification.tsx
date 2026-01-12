"use client";

import { useEffect, useState } from "react";
import { AuthStatus } from "../../types/auth";
import { useRouter } from "next/navigation";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Loading } from "@/components/ui/Loading";
import Link from "next/link";
import { useAuthStatus } from "../../hooks/useAuth";

export function VerifyEmailNotification() {
  const router = useRouter();
  const { data: authStatus, isLoading, error, refetch } = useAuthStatus();

  useEffect(() => {
    if (error && error.status === 401) {
      router.push("/sign-in");
    }
  }, [error, router]);

  if (isLoading) {
    return <Loading />;
  }

  if (!authStatus || error) {
    return (
      <ErrorDisplay
        message={
          error?.message ||
          (error instanceof Error ? error.message : "Something went wrong")
        }
        fullScreen={false}
        variant="danger"
        onRetry={() => {
          refetch();
        }}
      />
    );
  }

  return (
    <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 transform animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-center mb-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          <div className="relative w-20 h-20 bg-linear-to-br from-purple-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-300">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <div className="absolute top-0 right-0 w-4 h-4 bg-orange-500 rounded-full animate-ping"></div>
            <div className="absolute top-0 right-0 w-4 h-4 bg-orange-500 rounded-full border-2 border-black"></div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Check Your Email
        </h1>

        <div className="space-y-2">
          <p className="text-gray-300">We've sent a verification link to</p>
          {authStatus.email && (
            <div className="inline-block px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
              <p className="text-white font-medium">{authStatus.email}</p>
            </div>
          )}
          <p className="text-gray-300 max-w-xs mx-auto">
            Click the link in your email to verify your account and complete
            registration.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 bg-black/20 p-3 rounded-lg border border-white/5">
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Didn't receive it? Check your spam folder or wait a few minutes.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/sign-in"
          className="flex items-center justify-center px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-all font-semibold text-sm"
        >
          Back to Sign In
        </Link>
        <Link
          href="/sign-up"
          className="flex items-center justify-center px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02]"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
