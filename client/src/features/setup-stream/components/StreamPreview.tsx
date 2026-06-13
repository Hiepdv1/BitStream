"use client";

import React, { useState, useEffect } from "react";
import { VideoOff } from "lucide-react";
import VideoPlayer from "@/components/player/VideoPlayer";

interface StreamPreviewProps {
  streamId: string;
  dashUrl: string;
}

export const StreamPreview = ({ streamId, dashUrl }: StreamPreviewProps) => {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkStreamStatus = async () => {
      try {
        const response = await fetch(dashUrl, {
          method: "HEAD",
          cache: "no-store",
        });
        if (response.ok) {
          setIsLive(true);
        } else {
          setIsLive(false);
          timeoutId = setTimeout(checkStreamStatus, 3000);
        }
      } catch (error) {
        setIsLive(false);
        timeoutId = setTimeout(checkStreamStatus, 3000);
      }
    };

    if (!isLive) {
      checkStreamStatus();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [dashUrl, isLive]);

  return (
    <div className="w-full aspect-video bg-[#0a0a0f] rounded-2xl border border-white/5 overflow-hidden relative shadow-2xl">
      {isLive ? (
        <VideoPlayer
          streamId={streamId}
          dashUrl={dashUrl}
          isLive={true}
          autoPlay={true}
          totalDuration={0}
          showChatOption={false}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
            <VideoOff className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Waiting for stream...
          </h2>
          <p className="text-text-muted text-sm sm:text-base">
            Start streaming from your encoder to preview here
          </p>

          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/5">
            <div className="w-2 h-2 rounded-full bg-zinc-500" />
            <span className="text-xs font-semibold text-zinc-400 tracking-wider">
              OFFLINE
            </span>
          </div>
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/5">
            <span className="text-xs font-mono text-zinc-400 tracking-wider">
              00:00:00
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
