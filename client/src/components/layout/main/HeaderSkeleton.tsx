"use client";

import { memo } from "react";

/** Skeleton placeholder rendered by <Suspense> while the Header loads.
 *  Matches the exact height of the real Header (h-14) so layout does not shift.
 */
const HeaderSkeleton = () => {
  return (
    <header className="sticky top-0 z-50 w-full h-14 bg-white dark:bg-background border-b border-transparent">
      <nav className="mx-auto flex h-14 max-w-[1920px] items-center justify-between px-4 lg:px-6">
        {/* Logo skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="hidden sm:block w-20 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>

        {/* Nav links skeleton */}
        <div className="hidden xl:flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-16 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse"
            />
          ))}
        </div>

        {/* Search skeleton */}
        <div className="hidden sm:flex flex-1 max-w-md mx-8">
          <div className="w-full h-8 rounded-md bg-zinc-100 dark:bg-surface border border-zinc-200 dark:border-border animate-pulse" />
        </div>

        {/* Right actions skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      </nav>
    </header>
  );
};

export default memo(HeaderSkeleton);
