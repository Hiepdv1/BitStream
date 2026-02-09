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
        <h2 className="text-lg sm:text-xl font-bold text-text-main">
          Recommended
        </h2>
        {isHorizontal && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => scroll("left")}
              className="w-8 h-8 p-0 rounded-full bg-surface hover:bg-surface-hover border border-border"
            >
              <MoveLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => scroll("right")}
              className="w-8 h-8 p-0 rounded-full bg-surface hover:bg-surface-hover border border-border"
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
            : "flex flex-col gap-3"
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
              isHorizontal ? "flex-none snap-start w-72" : "block"
            }`}
          >
            <div
              className={`flex ${
                isHorizontal ? "flex-col" : "flex-row"
              } gap-3 p-2 rounded-xl hover:bg-surface-hover/50 transition-colors`}
            >
              <div
                className={`relative overflow-hidden rounded-xl bg-surface ${
                  isHorizontal
                    ? "aspect-video w-full"
                    : "w-40 sm:w-44 shrink-0 aspect-video"
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
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE
                    </span>
                  ) : video.duration ? (
                    <span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-semibold text-text-main line-clamp-2 text-sm group-hover:text-brand transition-colors">
                  {video.title}
                </h3>
                {video.creatorName && (
                  <p className="text-xs text-text-muted truncate">
                    {video.creatorName}
                  </p>
                )}
                {video.viewCount !== undefined && (
                  <p className="text-xs text-text-muted flex items-center gap-1">
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
