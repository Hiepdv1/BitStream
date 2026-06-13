"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

import VideoPlayer from "@/components/player/VideoPlayer";
import VideoInfo from "./VideoInfo";
import LiveChat from "./LiveChat";

import { cn } from "@/lib/utils";
import { StreamData } from "@/features/create-stream/types/stream";

interface WatchViewProps {
  streamId: string;
  streamData: StreamData;
}

const WatchView = ({ streamId, streamData }: WatchViewProps) => {
  const [isChatOpen, setIsChatOpen] = useState(
    structureChatState(streamData.isLive),
  );
  const [isLive, setIsLive] = useState(streamData.isLive);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);

  const handleTimeUpdate = useCallback((timeSec: number) => {
    setCurrentTimeSec(timeSec);
  }, []);

  const currentTimeMs = Math.floor(currentTimeSec * 1000);

  function structureChatState(live: boolean) {
    return live;
  }

  useEffect(() => {
    setIsLive(streamData.isLive);
  }, [streamData.isLive]);

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-full min-h-screen bg-zinc-50 dark:bg-background relative items-start">
      {/* LEFT COLUMN: Video + Info */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 relative w-full",
          !isTheaterMode && "mx-auto pt-0 lg:pt-6 lg:px-6",
        )}
      >
        {/* Video wrapper */}
        <div
          className={cn(
            "w-full bg-black relative shrink-0 z-10 transition-all duration-500",
            isTheaterMode
              ? "h-[85vh] lg:h-[calc(100vh-64px)] w-full"
              : "aspect-video max-h-[75vh] w-full shadow-xl lg:rounded-xl overflow-hidden",
          )}
        >
          <VideoPlayer
            streamId={streamId}
            autoPlay={true}
            isLive={isLive}
            dashUrl={streamData.manifestUrl}
            totalDuration={streamData.totalDuration}
            isTheaterMode={isTheaterMode}
            onTheaterToggle={() => setIsTheaterMode(!isTheaterMode)}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>

        {/* Video Info - allow scrolling below the video */}
        <div
          className={cn(
            "w-full px-4 lg:px-0 mt-6 pb-12 flex-1",
            isTheaterMode ? "px-4 lg:px-8 mt-8" : "",
          )}
        >
          <VideoInfo
            title={streamData.title}
            description={streamData.description || ""}
            viewCount={isLive ? 24500 : 0}
            createdAt={streamData.createdAt}
            creatorName={streamData.name}
            creatorAvatar={`${process.env.NEXT_PUBLIC_ASSET_URL}/avatar/${streamData.avatarUrl}`}
            isLive={isLive}
            tags={streamData.tags}
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Chat (Sticky/Fixed behavior) */}
      <div
        className={cn(
          "hidden lg:flex flex-col shrink-0 sticky top-[64px] h-[calc(100vh-64px)] border-l border-zinc-200 dark:border-border bg-white dark:bg-background transition-all duration-300 ease-in-out z-40 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[-4px_0_24px_rgba(0,0,0,0.2)]",
          isChatOpen
            ? "w-[340px] opacity-100"
            : "w-0 opacity-0 overflow-hidden border-none pr-0",
        )}
      >
        <div className="w-[340px] h-full flex flex-col pt-0">
          <LiveChat
            streamId={streamId}
            isLive={isLive}
            mode="sidebar"
            currentTimeMs={currentTimeMs}
          />
        </div>
      </div>

      {/* Toggle Chat Button Floating */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={cn(
          "hidden cursor-pointer lg:flex fixed top-[80px] z-50 items-center justify-center w-8 h-10 bg-black/40 hover:bg-black/80 backdrop-blur-md text-white transition-all duration-300 shadow-md rounded-l-md border border-r-0 border-white/10",
          isChatOpen ? "right-[340px]" : "right-0",
        )}
        title={isChatOpen ? "Hide Chat" : "Show Chat"}
      >
        {isChatOpen ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Chat Bottom Area */}
      <div className="lg:hidden w-full">
        <LiveChat
          streamId={streamId}
          isLive={isLive}
          mode="mobile"
          currentTimeMs={currentTimeMs}
        />
      </div>
    </div>
  );
};

export default memo(WatchView);
