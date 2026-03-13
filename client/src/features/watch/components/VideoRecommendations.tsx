"use client";

import { useRef } from "react";
import { MoveRight, MoveLeft, Play, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface RecommendedVideo {
  id: string;
  streamId: string;
  title: string;
  thumbnailUrl: string;
  creatorName?: string;
  viewCount?: number;
  duration?: string;
  isLive?: boolean;
}

interface VideoRecommendationsProps {
  videos: RecommendedVideo[];
  currentStreamId?: string;
  layout?: "horizontal" | "vertical";
}

export function VideoRecommendations({
  videos,
  currentStreamId,
  layout = "vertical",
}: VideoRecommendationsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const filteredVideos = videos.filter((v) => v.streamId !== currentStreamId);

  if (filteredVideos.length === 0) return null;

  const isHorizontal = layout === "horizontal";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
          Recommended
        </h2>
        {isHorizontal && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => scroll("left")}
              className="w-8 h-8 p-0 rounded-full bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/[0.06]"
            >
              <MoveLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => scroll("right")}
              className="w-8 h-8 p-0 rounded-full bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/[0.06]"
            >
              <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className={`${
          isHorizontal
            ? "flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x"
            : "flex flex-col gap-4"
        }`}
        style={
          isHorizontal
            ? { scrollbarWidth: "none", msOverflowStyle: "none" }
            : {}
        }
      >
        {filteredVideos.map((video) => (
          <Link
            key={video.id}
            href={`/watch/${video.streamId}`}
            className={`group ${
              isHorizontal ? "flex-none snap-start w-80" : "block"
            }`}
          >
            <div
              className={`flex ${
                isHorizontal ? "flex-col" : "flex-row"
              } gap-3.5 p-2 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-white/[0.04] transition-colors`}
            >
              <div
                className={`relative overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800 ${
                  isHorizontal
                    ? "aspect-video w-full"
                    : "w-44 sm:w-48 shrink-0 aspect-video"
                }`}
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-brand/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-2 right-2">
                  {video.isLive ? (
                    <span className="px-2 py-1 bg-red-500 text-white text-[11px] font-bold rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE
                    </span>
                  ) : video.duration ? (
                    <span className="px-2 py-1 bg-black/70 text-white text-[11px] font-medium rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5 py-0.5">
                <h3 className="font-semibold text-zinc-900 dark:text-white line-clamp-2 text-sm leading-snug group-hover:text-brand transition-colors">
                  {video.title}
                </h3>
                {video.creatorName && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {video.creatorName}
                  </p>
                )}
                {video.viewCount !== undefined && (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatViews(video.viewCount)} views
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
