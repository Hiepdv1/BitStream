"use client";

import { Heart, Star, Share2, MoreVertical, User, Users } from "lucide-react";

interface VideoInfoProps {
  title: string;
  description?: string;
  viewCount?: number;
  createdAt?: string;
  creatorName?: string;
  creatorAvatar?: string;
  isLive?: boolean;
  category?: string;
  tags?: string[];
}

export function VideoInfo({
  title,
  description,
  viewCount,
  createdAt,
  creatorName,
  creatorAvatar,
  isLive = false,
  category,
  tags = [],
}: VideoInfoProps) {
  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  if (isLive) {
    return (
      <div className="space-y-4">
        {/* Channel info + Title + Actions row */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-brand/30">
            {creatorAvatar ? (
              <img
                src={creatorAvatar}
                alt={creatorName || ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white leading-tight line-clamp-2">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-sm font-semibold text-brand hover:text-brand/80 cursor-pointer">
                {creatorName || "Unknown"}
              </span>
              {category && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-600">•</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {category}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white rounded-lg text-sm font-medium transition-all border border-zinc-200 dark:border-white/[0.06]">
              <Heart className="w-4 h-4" />
              Follow
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg text-sm font-bold transition-all">
              <Star className="w-4 h-4" />
              Subscribe
            </button>
          </div>
        </div>

        {/* Viewer count */}
        {viewCount !== undefined && viewCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-red-400" />
            <span className="font-bold text-zinc-900 dark:text-white">
              {formatViews(viewCount)}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              viewers watching now
            </span>
          </div>
        )}

        {/* LIVE badge + Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 text-xs font-medium rounded-md border border-zinc-200 dark:border-white/[0.06] cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-t border-zinc-200 dark:border-white/[0.06] pt-3">
          {["About", "Schedule", "Videos", "Clips"].map((tab, i) => (
            <button
              key={tab}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                i === 0
                  ? "text-zinc-900 dark:text-white border-brand"
                  : "text-zinc-400 dark:text-zinc-500 border-transparent hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // VOD Mode
  return (
    <div className="space-y-5">
      {/* Title + Action buttons row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white leading-tight line-clamp-2 flex-1">
          {title}
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg text-sm font-bold transition-all">
            <Heart className="w-4 h-4" />
            Follow
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white rounded-lg text-sm font-medium transition-all border border-zinc-200 dark:border-white/[0.06]">
            <Star className="w-4 h-4" />
            Subscribe
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white rounded-lg text-sm font-medium transition-all border border-zinc-200 dark:border-white/[0.06]">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="p-2 bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white rounded-lg transition-all border border-zinc-200 dark:border-white/[0.06]">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Channel info */}
      {creatorName && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center shrink-0 overflow-hidden">
            {creatorAvatar ? (
              <img
                src={creatorAvatar}
                alt={creatorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
              {creatorName}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {createdAt && `Streamed ${createdAt}`}
              {category && ` • ${category}`}
            </p>
          </div>
        </div>
      )}

      {/* About this VOD */}
      {(description || tags.length > 0) && (
        <div className="p-5 rounded-xl bg-zinc-50 dark:bg-[#1a1528]/80 border border-zinc-200 dark:border-white/[0.06]">
          <h3 className="font-bold text-zinc-900 dark:text-white text-sm mb-3">
            About this VOD
          </h3>
          {description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line mb-4">
              {description}
            </p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-brand/10 text-brand text-xs font-medium rounded-full cursor-pointer hover:bg-brand/20 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
