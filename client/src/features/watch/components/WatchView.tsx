"use client";

import { useState, useEffect } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { LiveChat } from "./LiveChat";
import { VideoInfo } from "./VideoInfo";
import { VideoRecommendations } from "./VideoRecommendations";
import { StreamData } from "@/features/stream/types/stream";
import {
  MessageSquare,
  MessageSquareOff,
  ChevronRight,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WatchViewProps {
  streamId: string;
  streamData: StreamData;
  recommendedVideos: any[];
}

export function WatchView({
  streamId,
  streamData,
  recommendedVideos,
}: WatchViewProps) {
  const [isChatOpen, setIsChatOpen] = useState(
    structureChatState(streamData.isLive),
  );
  const [isLive, setIsLive] = useState(streamData.isLive);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showChatReplay, setShowChatReplay] = useState(false);

  function structureChatState(live: boolean) {
    return live;
  }

  useEffect(() => {
    setIsLive(streamData.isLive);
  }, [streamData.isLive]);

  // VOD recent vods mock data
  const recentVods = [
    {
      id: "rv1",
      title: "Late Night Grinding...",
      time: "3 days ago",
      duration: "1:12:04",
      thumbnail:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop",
    },
    {
      id: "rv2",
      title: "No-Death Challeng...",
      time: "5 days ago",
      duration: "48:15",
      thumbnail:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop",
    },
  ];

  return (
    <div
      className={cn(
        "mx-auto p-0 transition-all duration-500",
        isTheaterMode ? "max-w-full" : "container max-w-[1920px] lg:px-4",
      )}
    >
      {/* Main Interface: Video + Chat */}
      <div
        className={cn(
          "flex flex-col lg:flex-row gap-0 mx-auto",
          isTheaterMode
            ? "h-[85vh] w-full max-w-none"
            : "w-full max-w-[1600px]",
        )}
      >
        {/* Player Column - normal aspect ratio, NOT full height */}
        <div
          className={cn(
            "bg-black overflow-hidden relative",
            isTheaterMode
              ? "flex-1 rounded-none w-full"
              : "w-full aspect-video max-h-[65vh]",
            !isLive && !isTheaterMode ? "lg:rounded-xl" : "",
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
          />
        </div>

        {/* Sidebar Chat Column (Desktop) - Live mode */}
        {isLive && (
          <div
            className={cn(
              "hidden lg:flex flex-col shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-out will-change-[width,opacity] h-full",
              isChatOpen
                ? "w-[340px] opacity-100 translate-x-0"
                : "w-0 opacity-0 translate-x-10",
            )}
          >
            <div
              className={cn(
                "w-full h-full overflow-hidden border-l border-zinc-200 dark:border-white/6 bg-white dark:bg-[#0e0b1a]",
                !isTheaterMode ? "aspect-video max-h-[70vh]" : "",
              )}
            >
              <LiveChat
                streamId={streamId}
                isLive={isLive}
                mode="sidebar"
                viewerCount={isLive ? 24500 : 0}
              />
            </div>
          </div>
        )}

        {/* VOD Chat Replay Panel */}
        {!isLive && showChatReplay && (
          <div
            className={cn(
              "hidden lg:flex flex-col shrink-0 overflow-hidden w-[340px]",
              isTheaterMode ? "h-full" : "",
              !isTheaterMode ? "aspect-video max-h-[70vh]" : "",
            )}
          >
            <div className="w-full h-full overflow-hidden border-l border-zinc-200 dark:border-white/6 bg-white dark:bg-[#0e0b1a]">
              <LiveChat streamId={streamId} isLive={false} mode="sidebar" />
            </div>
          </div>
        )}
      </div>

      {/* Chat Toggle Button - Live only */}
      {isLive && (
        <div className="hidden lg:flex justify-end px-2 mt-2">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="chat-toggle-btn flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-brand transition-all py-2 px-3 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5"
          >
            {isChatOpen ? (
              <>
                <MessageSquareOff className="w-4 h-4" />
                Hide Chat
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Show Chat
              </>
            )}
          </button>
        </div>
      )}

      {/* Supplementary Content */}
      <div className="px-4 lg:px-0 flex flex-col lg:flex-row gap-8 mt-5 pb-8">
        {/* Main info column */}
        <div
          className={cn(
            "flex-1 space-y-5 transition-all duration-500 min-w-0",
            isTheaterMode ? "max-w-7xl mx-auto" : "",
          )}
        >
          <VideoInfo
            title={streamData.title}
            description={streamData.description || ""}
            viewCount={isLive ? 24500 : 0}
            createdAt={streamData.createdAt}
            creatorName={"unknown"}
            isLive={isLive}
            category="Gaming"
            tags={
              isLive
                ? ["Esports", "English", "Finals", "NoBackseating"]
                : ["speedrun", "marathon", "worldrecord"]
            }
          />

          {/* Recommendations for live mode */}
          {isLive && (
            <div className="border-t border-zinc-200 dark:border-white/6 pt-6">
              <VideoRecommendations
                videos={recommendedVideos}
                currentStreamId={streamId}
                layout="horizontal"
              />
            </div>
          )}
        </div>

        {/* Right sidebar - VOD mode only */}
        {!isLive && (
          <div className="w-full lg:w-[340px] shrink-0 space-y-6">
            {/* Show Chat Replay button */}
            <button
              onClick={() => setShowChatReplay(!showChatReplay)}
              className={cn(
                "w-full flex items-center justify-between px-5 py-4 border rounded-xl transition-all group",
                showChatReplay
                  ? "bg-brand/10 border-brand/30 dark:bg-brand/10 dark:border-brand/20"
                  : "bg-zinc-50 dark:bg-[#1a1528]/80 hover:bg-zinc-100 dark:hover:bg-[#1a1528] border-zinc-200 dark:border-white/6",
              )}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-brand" />
                <span className="text-sm font-semibold text-brand">
                  {showChatReplay ? "Hide Chat Replay" : "Show Chat Replay"}
                </span>
              </div>
              <ChevronRight
                className={cn(
                  "w-4 h-4 text-brand transition-transform",
                  showChatReplay ? "rotate-90" : "group-hover:translate-x-0.5",
                )}
              />
            </button>

            {/* Recent VODs */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Recent VODs
              </h3>
              {recentVods.map((vod) => (
                <div
                  key={vod.id}
                  className="flex gap-3.5 group cursor-pointer rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-white/4 transition-colors"
                >
                  <div className="relative w-36 aspect-video rounded-lg overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-800">
                    <img
                      src={vod.thumbnail}
                      alt={vod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 rounded text-[11px] font-medium text-white flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {vod.duration}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-2 group-hover:text-brand transition-colors leading-snug">
                      {vod.title}
                    </h4>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">
                      {vod.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations for VOD mode */}
            <div className="border-t border-zinc-200 dark:border-white/6 pt-5">
              <VideoRecommendations
                videos={recommendedVideos}
                currentStreamId={streamId}
                layout="vertical"
              />
            </div>
          </div>
        )}
      </div>

      <div className="lg:hidden">
        <LiveChat
          streamId={streamId}
          isLive={isLive}
          mode="mobile"
          viewerCount={isLive ? 24500 : 0}
        />
      </div>
    </div>
  );
}
