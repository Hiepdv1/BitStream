import { memo } from "react";
import { LayoutGrid, BadgePlus, Users, Eye, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface StudioHeaderProps {
  isCreator: boolean;
  userName: string;
  avatarUrl?: string | null;
  followers?: number;
  totalViews?: number;
  isLive?: boolean;
}

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

export const StudioHeader = memo(
  ({
    isCreator,
    userName,
    avatarUrl,
    followers = 0,
    totalViews = 0,
    isLive = false,
  }: StudioHeaderProps) => {
    const initials = userName ? userName.slice(0, 2).toUpperCase() : "?";
    const avatar = `${process.env.NEXT_PUBLIC_ASSET_URL}/assets/avatar/${avatarUrl}`;

    return (
      <div className="relative w-full overflow-hidden">
        {/* Ambient background gradient */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none select-none"
        >
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-brand/10 dark:bg-brand/15 blur-[100px]" />
          <div className="absolute -top-20 left-1/4 w-[400px] h-[300px] rounded-full bg-orange-500/8 blur-[80px]" />
        </div>

        <div className="relative z-10 px-6 md:px-10 lg:px-14 pt-10 pb-8">
          {/* Top row: avatar + name + actions */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            {/* Left: Avatar + Info */}
            <div className="flex items-end gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl bg-surface">
                  {avatarUrl ? (
                    <img
                      src={avatar}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-brand to-accent text-white font-extrabold text-2xl tracking-tight">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Live indicator badge */}
                {isLive && (
                  <div className="absolute -bottom-2 -right-2 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-red-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </div>
                )}
              </div>

              {/* Name & meta */}
              <div className="space-y-1.5 pb-1">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-text-main tracking-tight leading-none">
                  {userName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {formatNumber(followers)} followers
                  </span>
                  <span className="w-1 h-1 rounded-full bg-text-muted/40" />
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    {formatNumber(totalViews)} views
                  </span>
                  <span className="w-1 h-1 rounded-full bg-text-muted/40" />
                  <span className="flex items-center gap-1.5 text-orange-500">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Official Creator
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Action buttons (creator only) */}
            {isCreator && (
              <div className="flex items-center gap-3 shrink-0">
                <Link href="/stream/manager">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 font-semibold"
                  >
                    <LayoutGrid className="w-4 h-4 mr-1" />
                    Manage Studio
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mt-8 h-px bg-border/60" />
        </div>
      </div>
    );
  },
);

StudioHeader.displayName = "StudioHeader";
