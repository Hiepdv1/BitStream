"use client";

import { CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function AlreadyVerified() {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative overflow-hidden bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 rounded-3xl shadow-2xl p-6 sm:p-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center space-y-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative w-24 h-24 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck
                className="w-12 h-12 text-white drop-shadow-md"
                strokeWidth={2.5}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-2 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-green-500 fill-current" />
            </div>
          </div>

          <div className="text-center space-y-3 max-w-sm">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Already Verified
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              This verification link has already been used. Your account is
              active and ready.
            </p>
          </div>

          <div className="w-full max-w-xs space-y-4">
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gray-50 dark:bg-black/40 px-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  Access Account
                </span>
              </div>
            </div>

            <Link href="/" className="block w-full">
              <Button className="w-full h-12 font-semibold bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors rounded-xl shadow-md">
                Start Watching <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
