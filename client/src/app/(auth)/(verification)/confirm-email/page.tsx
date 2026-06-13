"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loading } from "@/components/ui/Loading";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { extractApiError } from "@/lib/http/extractApiError";
import {
  AlreadyVerified,
  VerificationSuccess,
} from "@/features/auth/components";
import { setAuthExpiries } from "@/lib/auth/tokenUtils";
import { useEmailVerification } from "@/features/auth/hooks/useVerification";
import { useAppQueryClient } from "@/hooks";

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-full min-h-[400px]">
          <Loading size="lg" className="text-brand dark:text-white" />
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("v");
  const { removeQueryProfile } = useAppQueryClient();

  const {
    mutate: verifyEmail,
    isPending,
    isSuccess,
    isError,
    error,
    data,
  } = useEmailVerification();

  useEffect(() => {
    if (token) {
      verifyEmail(token, {
        onSuccess: (data) => {
          removeQueryProfile();
          setAuthExpiries(
            data.accessTokenExpiresAt,
            data.refreshTokenExpiresAt,
          );
        },
      });
    }
  }, [token, verifyEmail]);

  if (isPending || (token && !isSuccess && !isError)) {
    return (
      <div className="flex items-center justify-center w-full min-h-[400px]">
        <Loading
          size="lg"
          text="Verifying your email..."
          className="text-brand dark:text-white"
        />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full flex justify-center p-4">
        <ErrorDisplay
          title="Invalid Verification Link"
          message="The verification link is missing the required token. Please check your email and try again with the complete link."
          variant="warning"
          fullScreen={false}
        />
      </div>
    );
  }

  if (isError) {
    const apiError = extractApiError(error);

    if (apiError.status === 400) {
      return (
        <div className="w-full flex justify-center p-4">
          <AlreadyVerified />
        </div>
      );
    }

    return (
      <div className="w-full flex justify-center p-4">
        <ErrorDisplay
          title="Verification Failed"
          message={
            apiError.message ||
            "Unable to verify your email. The link may be expired or invalid."
          }
          variant="danger"
          fullScreen={false}
          onRetry={() => verifyEmail(token)}
        />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <VerificationSuccess onNavigateHome={() => router.push("/")} />
      </div>
    );
  }

  return null;
}
