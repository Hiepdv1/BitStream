"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { LiveChat } from "./LiveChat";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Settings,
  Loader2,
  MessageSquare,
  MessageSquareOff,
} from "lucide-react";
import { useDash } from "../hooks/useDash";
import { usePlayerState } from "../hooks/usePlayerState";
import "../styles/VideoPlayer.css";

interface VideoPlayerProps {
  streamId: string;
  autoPlay?: boolean;
  isLive?: boolean;
  totalDuration: number;
  onError?: (error: string) => void;
}

export function VideoPlayer({
  streamId,
  autoPlay = true,
  isLive = false,
  totalDuration,
  onError,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const [totalDurationState, setTotalDurationState] = useState(totalDuration);
  const [isLiveStream, setIsLiveStream] = useState(isLive);
  const [showControls, setShowControls] = useState(true);
  const [showChatOverlay, setShowChatOverlay] = useState(true);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  const dashUrl = useMemo(() => {
    const cdnBase = isLive
      ? `http://localhost:8080/live/streams/${streamId}/manifest.mpd`
      : `http://localhost:8080/api/stream/watch/${streamId}/manifest.mpd`;

    return cdnBase;
  }, [streamId, isLive]);

  useEffect(() => {
    if (totalDuration !== totalDurationState) {
      setTotalDurationState(totalDuration);
    }
    if (isLive !== isLiveStream) {
      setIsLiveStream(isLive);
    }
  }, [totalDuration, isLive, totalDurationState, isLiveStream]);

  const {
    isPlaying,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    progress,
    currentTime,
    duration,
    buffered,
    isFullscreen,
    togglePlay,
    handleSeek: originalHandleSeek,
  } = usePlayerState(videoRef);

  const handleMutedAutoplay = useCallback(() => {
    setIsMuted(true);
  }, [setIsMuted]);

  const { isLoading, isOffline, hasError, errorMessage } = useDash({
    url: dashUrl,
    videoRef,
    autoPlay,
    isLive: isLiveStream,
    onMutedAutoplay: handleMutedAutoplay,
  });

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0)
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const displayDuration = totalDurationState || duration;
  const displayProgress =
    totalDurationState > 0
      ? (currentTime / totalDurationState) * 100
      : progress;

  const handleSeek = (position: number) => {
    originalHandleSeek(position);
  };

  const handleProgressBarInteraction = (
    e: React.PointerEvent | React.MouseEvent,
  ) => {
    if (isLiveStream || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    handleSeek(pos);
  };

  const handleVolumeBarInteraction = (
    e: React.PointerEvent | React.MouseEvent,
  ) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const val = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(val);
    if (val > 0) setIsMuted(false);
    else setIsMuted(true);
  };

  useEffect(() => {
    if (!isDraggingProgress && !isDraggingVolume) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingProgress) handleProgressBarInteraction(e as any);
      if (isDraggingVolume) handleVolumeBarInteraction(e as any);
    };

    const handlePointerUp = () => {
      setIsDraggingProgress(false);
      setIsDraggingVolume(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDraggingProgress, isDraggingVolume]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Report errors to parent
  useEffect(() => {
    if (hasError && onError) {
      onError(errorMessage);
    }
  }, [hasError, errorMessage, onError]);

  if (hasError) {
    return (
      <div className="video-container bg-zinc-900 text-white p-6">
        <h3 className="text-xl font-bold text-red-500">Video Error</h3>
        <p className="text-zinc-400 mt-2">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-brand rounded-lg hover:bg-brand/80 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`video-container ${isFullscreen ? "fullscreen" : ""}`}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* FULLSCREEN CHAT OVERLAY */}
      {isFullscreen && showChatOverlay && !isOffline && (
        <LiveChat streamId={streamId} isLive={isLive} mode="overlay" />
      )}

      {/* LIVE BADGE (Normal View) */}
      {isLiveStream && !isOffline && !isFullscreen && (
        <div className="absolute top-4 left-4 z-30 slide-in-top">
          <div className="live-badge">
            <span className="live-dot animate-live-pulse" />
            LIVE
          </div>
        </div>
      )}

      {/* OFFLINE STATE */}
      {isOffline && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-900 text-white p-6">
          <h3 className="text-2xl font-bold mb-2">Stream Offline</h3>
          <p className="text-zinc-400">Please check back later.</p>
        </div>
      )}

      {/* VIDEO ELEMENT */}
      <video
        ref={videoRef}
        className="video-element"
        style={{ display: isOffline ? "none" : "block" }}
        playsInline
        onClick={togglePlay}
      />

      {/* CENTER UI (Play Button/Spinner) */}
      {!isPlaying && !isLoading && !isOffline && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors z-10"
        >
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-xl">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </button>
      )}

      {isLoading && !isOffline && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <Loader2 className="w-12 h-12 text-brand animate-spin" />
        </div>
      )}

      {/* CONTROLS OVERLAY */}
      {!isOffline && (
        <div
          className={`controls-overlay ${showControls || !isPlaying ? "opacity-100" : "opacity-0"}`}
        >
          {/* PROGRESS BAR (VOD Only) */}
          {!isLiveStream && (
            <div
              ref={progressRef}
              className="progress-bar-container"
              onClick={handleProgressBarInteraction}
              onPointerDown={(e) => {
                setIsDraggingProgress(true);
                handleProgressBarInteraction(e);
              }}
            >
              <div
                className="progress-buffered"
                style={{ width: `${buffered}%` }}
              />
              <div
                className="progress-playhead"
                style={{ width: `${displayProgress}%` }}
              >
                <div className="progress-thumb" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            {/* LEFT CONTROLS */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="text-white hover:text-brand transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-white" />
                ) : (
                  <Play className="w-6 h-6 fill-white" />
                )}
              </button>

              <div className="flex items-center gap-3 text-white">
                {isLiveStream ? (
                  isFullscreen && (
                    <div className="live-badge">
                      <span className="live-dot animate-live-pulse" />
                      LIVE
                    </div>
                  )
                ) : (
                  <div className="text-xs sm:text-sm tabular-nums">
                    <span>{formatTime(currentTime)}</span>
                    <span className="mx-1 text-zinc-500">/</span>
                    <span className="text-zinc-400">
                      {formatTime(displayDuration)}
                    </span>
                  </div>
                )}
              </div>

              {/* VOLUME */}
              <div className="flex items-center gap-2 group-hover-volume ml-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:text-brand transition-colors p-1"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <div className="volume-slider-container">
                  <div
                    ref={volumeRef}
                    className="volume-bar"
                    onPointerDown={(e) => {
                      setIsDraggingVolume(true);
                      handleVolumeBarInteraction(e);
                    }}
                    onClick={handleVolumeBarInteraction}
                  >
                    <div
                      className="volume-active"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    >
                      <div
                        className={`volume-thumb ${isDraggingVolume ? "opacity-100" : ""}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CONTROLS */}
            <div className="flex items-center gap-4">
              {isFullscreen && (
                <button
                  onClick={() => setShowChatOverlay(!showChatOverlay)}
                  className={`transition-colors ${showChatOverlay ? "text-brand" : "text-white hover:text-brand"}`}
                  aria-label={showChatOverlay ? "Hide chat" : "Show chat"}
                >
                  {showChatOverlay ? (
                    <MessageSquare className="w-5 h-5" />
                  ) : (
                    <MessageSquareOff className="w-5 h-5" />
                  )}
                </button>
              )}
              <button
                className="text-white hover:text-brand transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-brand transition-colors"
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
