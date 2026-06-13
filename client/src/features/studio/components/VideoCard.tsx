"use client";

import { memo, useCallback } from "react";
import { Play, Eye, Clock, Calendar, MoreVertical } from "lucide-react";

export interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  duration: number; // seconds
  views: number;
  streamedAt: string; // ISO string
  game?: string;
  isLive?: boolean;
}

interface VideoCardProps {
  video: VideoItem;
  onPlay?: (id: string) => void;
}

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const formatViews = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// Gradient palette for placeholder thumbnails
const GRADIENTS = [
  "from-brand/40 to-purple-800",
  "from-orange-600/50 to-red-900",
  "from-sky-600/40 to-blue-900",
  "from-emerald-600/40 to-teal-900",
  "from-pink-600/40 to-rose-900",
  "from-amber-600/40 to-yellow-900",
];

const getGradient = (id: string): string =>
  GRADIENTS[
    id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % GRADIENTS.length
  ];

export const VideoCard = memo(({ video, onPlay }: VideoCardProps) => {
  const handlePlay = useCallback(() => {
    onPlay?.(video.id);
  }, [onPlay, video.id]);

  const gradient = getGradient(video.id);

  return (
    <article
      className="group relative flex flex-col bg-surface border border-border rounded-xl overflow-hidden hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5 transition-all duration-200 cursor-pointer"
      onClick={handlePlay}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={`w-full h-full bg-linear-to-br ${gradient} flex items-center justify-center`}
          >
            <Play className="w-8 h-8 text-white/30 stroke-[1.5]" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl">
            <Play className="w-4 h-4 text-slate-900 fill-slate-900 ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide">
          {video.isLive ? (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </span>
          ) : (
            formatDuration(video.duration)
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <h3 className="text-sm font-semibold text-text-main line-clamp-2 leading-snug group-hover:text-brand transition-colors">
          {video.title}
        </h3>

        <div className="flex flex-col gap-1 mt-auto">
          {video.game && (
            <p className="text-xs text-brand font-medium truncate">
              {video.game}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 shrink-0" />
              {formatViews(video.views)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 shrink-0" />
              {formatDate(video.streamedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* More options button */}
      <button
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80"
        onClick={(e) => {
          e.stopPropagation();
          // TODO: open context menu
        }}
        aria-label="More options"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
    </article>
  );
});

VideoCard.displayName = "VideoCard";
