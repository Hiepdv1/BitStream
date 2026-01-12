"use client";

import { CheckCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface VerificationSuccessProps {
  onNavigateHome?: () => void;
}

export function VerificationSuccess({
  onNavigateHome,
}: VerificationSuccessProps) {
  const router = useRouter();
  const handleNavigate = onNavigateHome || (() => router.push("/"));

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative overflow-hidden bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 rounded-3xl shadow-2xl p-6 sm:p-10">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center space-y-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
            <div className="relative w-24 h-24 bg-linear-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <CheckCircle
                className="w-12 h-12 text-white drop-shadow-md"
                strokeWidth={3}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-black p-1.5 rounded-full shadow-md">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="text-center space-y-4 max-w-sm">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Email Verified!
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
              Your account has been successfully activated. You're all set to
              start streaming.
            </p>
          </div>

          <div className="w-full max-w-xs space-y-4">
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gray-50 dark:bg-black/40 px-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  Next Steps
                </span>
              </div>
            </div>

            <Button
              onClick={handleNavigate}
              className="w-full h-14 text-lg font-bold rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5"
            >
              Start Watching <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              redirecting you to the home page...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
