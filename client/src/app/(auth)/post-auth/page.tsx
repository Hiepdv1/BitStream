"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/features/auth/helpers";
import { UI_TEXT } from "@/features/auth/constants";
import { httpRequest } from "@/lib/http/client/http-client";
import { extractApiError } from "@/lib/http/extractApiError";

type VerificationStatus = "loading" | "success" | "error";

export default function PostAuthPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState<string>(
    UI_TEXT.auth.postAuth.loading.message
  );

  const isVerified = useRef(false);

  const ui = UI_TEXT.auth.postAuth;

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace("/sign-in");
      return;
    }

    if (sessionStatus === "authenticated" && !isVerified.current) {
      isVerified.current = true;
      const verify = async () => {
        try {
          const result = getAuthToken(session);

          if (!result || !result.token) {
            throw new Error("No valid authentication token found.");
          }

          const res = await httpRequest<null>({
            url: "/proxy/external-auth/sign-in/social",
            method: "POST",
            withCredentials: true,
          });

          if (!res.success) {
            setStatus("error");
            setMessage(res.message || ui.error.defaultMessage);
            setTimeout(() => signOut({ callbackUrl: "/sign-in" }), 2000);
            return;
          }

          setStatus("success");
          setMessage(ui.success.message);
          setTimeout(() => router.replace("/"), 2000);
        } catch (error: any) {
          const apiError = extractApiError(error);
          setStatus("error");
          setMessage(apiError.message || ui.error.defaultMessage);
          setTimeout(() => signOut({ callbackUrl: "/sign-in" }), 2000);
        }
      };

      verify();
    }
  }, [sessionStatus, session, router]);

  const getStatusUI = () => {
    switch (status) {
      case "loading":
        return {
          title: ui.loading.title,
          color: ui.ui.loadingColor,
          icon: (
            <div className="w-16 h-16 rounded-full border-4 border-t-brand border-r-transparent border-b-brand border-l-transparent animate-spin" />
          ),
        };
      case "success":
        return {
          title: ui.success.title,
          color: ui.ui.successColor,
          icon: (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
        };
      case "error":
        return {
          title: ui.error.title,
          color: ui.ui.errorColor,
          icon: (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ),
        };
    }
  };

  const currentUI = getStatusUI();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('/auth-bg.jpg')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 shadow-2xl text-center space-y-6 mx-4">
        <div className="flex justify-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${currentUI.color}`}
          >
            {currentUI.icon}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-wide text-white">
            {currentUI.title}
          </h2>
          <p className="text-text-muted text-sm font-medium animate-pulse">
            {message}
          </p>
        </div>

        {status === "error" && (
          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="w-full py-3 rounded-xl font-bold text-white bg-error/80 hover:bg-red-600 transition-colors shadow-lg"
          >
            {ui.error.returnButton}
          </button>
        )}
      </div>
    </div>
  );
}
