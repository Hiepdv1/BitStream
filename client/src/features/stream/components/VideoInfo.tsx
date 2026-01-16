"use client";

import {
  ThumbsUp,
  Share2,
  Bookmark,
  MoreHorizontal,
  Eye,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface VideoInfoProps {
  title: string;
  description?: string;
  viewCount?: number;
  createdAt?: string;
  creatorName?: string;
  creatorAvatar?: string;
  isLive?: boolean;
}

export function VideoInfo({
  title,
  description,
  viewCount,
  createdAt,
  creatorName,
  creatorAvatar,
  isLive = false,
}: VideoInfoProps) {
  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                LIVE
              </span>
            )}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-main line-clamp-2">
              {title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
            {viewCount !== undefined && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {formatViews(viewCount)} views
              </span>
            )}
            {createdAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {createdAt}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover text-text-main border border-border transition-all hover:scale-105"
          >
            <ThumbsUp className="w-5 h-5" />
            <span className="hidden sm:inline">Like</span>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover text-text-main border border-border transition-all hover:scale-105"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover text-text-main border border-border transition-all hover:scale-105"
          >
            <Bookmark className="w-5 h-5" />
            <span className="hidden sm:inline">Save</span>
          </Button>

          <Button
            variant="ghost"
            className="w-10 h-10 p-0 rounded-xl bg-surface hover:bg-surface-hover text-text-main border border-border"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {creatorName && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-brand to-accent flex items-center justify-center shrink-0 overflow-hidden">
            {creatorAvatar ? (
              <img
                src={creatorAvatar}
                alt={creatorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-main truncate">
              {creatorName}
            </h3>
            <p className="text-sm text-text-muted">Streamer</p>
          </div>
          <Button className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-medium transition-all hover:scale-105">
            Follow
          </Button>
        </div>
      )}

      {description && (
        <div className="p-4 rounded-2xl bg-surface border border-border">
          <p className="text-text-secondary leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
