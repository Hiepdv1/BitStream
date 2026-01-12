import { Logo } from "@/components/brand";
import React from "react";
import Link from "next/link";

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-black">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-linear-to-r from-purple-900/40 to-black/80"></div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>

        <div className="relative z-10 w-full flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2">
            <Logo className="w-10 h-10" />
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight max-w-lg">
              Your Gateway to <span className="text-purple-400">Unlimited</span>{" "}
              Entertainment.
            </h1>
            <p className="text-lg text-gray-300 max-w-md">
              Watch anywhere. Cancel anytime. Join millions of members enjoying
              the best entertainment.
            </p>
          </div>

          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} BitStream. All rights reserved.
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative cinema-bg">
        <div className="cinema-content w-full max-w-md space-y-8">
          {children}
        </div>

        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Logo
              className="w-8 h-8"
              textClassName="text-xl text-white"
              showText={true}
              useGradientText={false}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
