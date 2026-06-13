"use client";

import { memo, Suspense } from "react";
import { Header } from "./Header";
import HeaderSkeleton from "./HeaderSkeleton";
import { cn } from "@/lib/utils";

interface HeaderOnlyLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const HeaderOnlyLayout = ({ children, className }: HeaderOnlyLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-background relative selection:bg-brand/30 selection:text-white">
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
      <main className={cn("flex-1 flex flex-col w-full", className)}>
        {children}
      </main>
    </div>
  );
};

export default memo(HeaderOnlyLayout);
