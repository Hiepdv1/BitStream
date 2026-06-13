"use client";

import { memo } from "react";

/** Skeleton rendered while AdminHeader's useSuspenseProfile resolves. */
const AdminHeaderSkeleton = () => {
  return (
    <header className="h-16 w-full bg-background border-b border-border flex items-center justify-between px-6 shrink-0">
      {/* Search skeleton */}
      <div className="flex-1 max-w-xl">
        <div className="w-full h-10 rounded-lg bg-surface border border-border animate-pulse" />
      </div>

      {/* Right actions skeleton */}
      <div className="flex items-center gap-3 ml-6">
        <div className="w-9 h-9 rounded-md bg-surface animate-pulse" />
        <div className="w-9 h-9 rounded-md bg-surface animate-pulse" />
        <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />
      </div>
    </header>
  );
};

export default memo(AdminHeaderSkeleton);
