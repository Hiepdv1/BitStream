"use client";

import { memo, useState, useCallback } from "react";
import { Clapperboard } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { VideoCard, VideoItem } from "./VideoCard";
import { Pagination } from "@/components/ui/Pagination";

// ── Mock data (replace with real API data) ────────────────────────────────────
const MOCK_VIDEOS: VideoItem[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `v${i + 1}`,
  title: `Epic Stream Highlight #${i + 1} - The best moments from the broadcast`,
  game:
    i % 3 === 0
      ? "CyberArena 2077"
      : i % 2 === 0
        ? "StarQuest"
        : "Party Brawlers",
  duration: 5400 + ((i * 500) % 10000),
  views: 10000 + ((i * 15000) % 300000),
  streamedAt: new Date(Date.now() - (i + 1) * 86400_000).toISOString(),
}));

// ── VideoGridSkeleton ─────────────────────────────────────────────────────────
const VideoGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="flex flex-col gap-2">
        <div className="w-full aspect-video rounded-xl bg-surface border border-border animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-surface animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-surface animate-pulse" />
      </div>
    ))}
  </div>
);

// ── VideoGrid ─────────────────────────────────────────────────────────────────
interface VideoGridProps {
  videos?: VideoItem[];
  isLoading?: boolean;
  title?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
}

export const VideoGrid = memo(
  ({
    videos = MOCK_VIDEOS,
    isLoading = false,
    title = "All Videos",
    page,
    totalPages,
    onPageChange,
    itemsPerPage = 10,
  }: VideoGridProps) => {
    // Fallback internal pagination if external is not provided
    const [internalPage, setInternalPage] = useState(1);

    const handlePlay = useCallback((id: string) => {
      console.log("play", id);
      // TODO: navigate to video player
    }, []);

    // Determine current pagination state
    const isControlled =
      page !== undefined &&
      totalPages !== undefined &&
      onPageChange !== undefined;
    const currentPage = isControlled ? page : internalPage;
    const totalItems = videos.length;
    const calcTotalPages = isControlled
      ? totalPages
      : Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = useCallback(
      (newPage: number) => {
        if (currentPage === newPage) return;

        if (isControlled) {
          onPageChange(newPage);
        } else {
          setInternalPage(newPage);
          window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to top smoothly when page changes internally
        }
      },
      [isControlled, onPageChange],
    );

    // Data slicing
    // If controlled, assume the parent passed exactly the videos for the current page
    // If not controlled, slice the videos array
    const visibleVideos = isControlled
      ? videos
      : videos.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage,
        );

    return (
      <div className="w-full">
        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <SectionHeading title={title} />
        </div>

        {/* Grid */}
        {isLoading ? (
          <VideoGridSkeleton />
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center">
              <Clapperboard className="w-8 h-8 text-text-muted stroke-[1.5]" />
            </div>
            <div>
              <p className="text-base font-semibold text-text-main">
                No videos yet
              </p>
              <p className="text-sm text-text-muted mt-1">
                Go live to start creating your video library
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Result count */}
            <p className="text-xs text-text-muted mb-4">
              {isControlled
                ? `Showing videos for page ${currentPage}`
                : `Showing ${visibleVideos.length} of ${totalItems} video${totalItems !== 1 ? "s" : ""}`}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {visibleVideos.map((video) => (
                <VideoCard key={video.id} video={video} onPlay={handlePlay} />
              ))}
            </div>

            {/* Pagination */}
            {calcTotalPages > 1 && (
              <div className="flex justify-center mt-8 mb-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={calcTotalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  },
);

VideoGrid.displayName = "VideoGrid";
