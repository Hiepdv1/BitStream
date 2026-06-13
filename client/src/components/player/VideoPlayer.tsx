"use client";

import { useRef, useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2,
  Loader2,
  MessageSquare,
  MessageSquareOff,
  MonitorPlay,
  Settings,
  Check,
  RotateCcw,
} from "lucide-react";
import { useDash } from "@/hooks/useDash";
import { usePlayerState } from "@/hooks/usePlayerState";
import { Button } from "@/components/ui/Button";
import LiveChat from "@/features/watch/components/LiveChat";
import { useRouter } from "next/navigation";

interface VideoPlayerProps {
  streamId: string;
  dashUrl: string;
  autoPlay?: boolean;
  isLive?: boolean;
  totalDuration: number;
  isTheaterMode?: boolean;
  onTheaterToggle?: () => void;
  onError?: (error: string) => void;
  onTimeUpdate?: (currentTimeSec: number) => void;
  showChatOption?: boolean;
}

const VideoPlayer = ({
  streamId,
  autoPlay = true,
  isLive = false,
  totalDuration,
  isTheaterMode = false,
  onTheaterToggle,
  onError,
  dashUrl,
  onTimeUpdate,
  showChatOption = true,
}: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const [showControls, setShowControls] = useState(true);
  const [showChatOverlay, setShowChatOverlay] = useState(true);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isStreamEnded, setIsStreamEnded] = useState(false);
  const router = useRouter();

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
  } = usePlayerState(videoRef);

  useEffect(() => {
    onTimeUpdate?.(currentTime);
  }, [currentTime, onTimeUpdate]);

  const handleMutedAutoplay = useCallback(() => {
    setIsMuted(true);
  }, [setIsMuted]);

  const onDashEnded = useCallback(() => {
    setIsStreamEnded(true);
  }, []);

  const handleVodEnded = useCallback(() => {
    if (!isLive) {
      setIsStreamEnded(true);
    }
  }, [isLive]);

  const handleReplay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsStreamEnded(false);
    
    if (isLive) {
      // Refresh to fetch VOD data when Live ends
      router.refresh();
    } else {
      // Replay current VOD without refreshing
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isLive, router]);

  const {
    isLoading,
    isOffline,
    hasError,
    errorMessage,
    availableQualities,
    isAutoQuality,
    activeQualityIndex,
    setQuality,
    seekTo,
  } = useDash({
    url: dashUrl,
    videoRef,
    autoPlay,
    isLive,
    streamId,
    onMutedAutoplay: handleMutedAutoplay,
    onEnded: onDashEnded,
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

  const displayDuration = totalDuration || duration;
  const displayProgress =
    displayDuration > 0 ? (currentTime / displayDuration) * 100 : progress;

  const handleSeek = useCallback(
    (pos: number) => {
      if (!displayDuration) return;
      const time = Math.max(
        0,
        Math.min(pos * displayDuration, displayDuration),
      );
      seekTo(time);
    },
    [displayDuration, seekTo],
  );

  const handleProgressBarInteraction = useCallback(
    (e: React.PointerEvent | React.MouseEvent) => {
      if (isLive || !progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const pos = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      handleSeek(pos);
    },
    [isLive, handleSeek],
  );

  const handleVolumeBarInteraction = useCallback(
    (e: React.PointerEvent | React.MouseEvent) => {
      if (!volumeRef.current) return;
      const rect = volumeRef.current.getBoundingClientRect();
      const val = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      setVolume(val);
      setIsMuted(val === 0);
    },
    [setVolume, setIsMuted],
  );

  const getQualityLabel = () => {
    const activeQ = availableQualities.find(
      (q) => q.index === activeQualityIndex,
    );
    const label = activeQ ? activeQ.label : "Auto";
    return isAutoQuality ? `Auto${activeQ ? ` (${label})` : ""}` : label;
  };

  const toggleQualityMenu = () => {
    setShowQualityMenu((prev) => !prev);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
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
  }, [
    isDraggingProgress,
    isDraggingVolume,
    handleProgressBarInteraction,
    handleVolumeBarInteraction,
  ]);

  useEffect(() => {
    if (hasError && onError) onError(errorMessage);
  }, [hasError, errorMessage, onError]);

  useEffect(() => {
    if (!showQualityMenu) return;
    const handleClickOutside = () => setShowQualityMenu(false);
    document.addEventListener("click", handleClickOutside, { capture: true });

    return () =>
      document.removeEventListener("click", handleClickOutside, {
        capture: true,
      });
  }, [showQualityMenu]);

  if (hasError) {
    return (
      <div className="video-container bg-zinc-900 text-white p-6">
        <h3 className="text-xl font-bold text-red-500">Video Error</h3>
        <p className="text-zinc-400 mt-2">{errorMessage}</p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => window.location.reload()}
        >
          Reload
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="video-container group/player relative w-full h-full bg-black"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* VIDEO AREA - Loading overlay only covers this */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          onClick={togglePlay}
          onEnded={handleVodEnded}
        />

        {/* TOP BADGES */}
        {isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 rounded text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          </div>
        )}

        {/* PLAY/REPLAY BUTTON OVERLAY (paused/ended, not loading) */}
        {(!isPlaying || isStreamEnded) && !isLoading && !isOffline && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 cursor-pointer"
            onClick={isStreamEnded ? handleReplay : togglePlay}
          >
            <div className="md:w-16 md:h-16 w-12 h-12 rounded-full bg-brand/80 backdrop-blur-md flex items-center justify-center border-2 border-brand shadow-2xl shadow-brand/30 transition-transform hover:scale-110">
              {isStreamEnded ? (
                <RotateCcw className="md:w-6 md:h-6 w-4 h-4 text-white" />
              ) : (
                <Play className="md:w-6 md:h-6 w-4 h-4 text-white fill-current ml-1" />
              )}
            </div>
          </div>
        )}

        {/* LOADING OVERLAY - Only covers video area, NOT controls */}
        {isLoading && !isOffline && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <Loader2 className="w-12 h-12 text-brand animate-spin" />
          </div>
        )}
      </div>

      {/* CONTROLS OVERLAY - Outside the loading overlay zone */}
      {!isOffline && (
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 z-30 ${
            showControls || !isPlaying
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {/* PROGRESS BAR (VOD Only) */}
          {!isLive && (
            <div className="mb-3 group/progress cursor-pointer relative h-2">
              <div
                ref={progressRef}
                className="absolute inset-y-0 left-0 right-0 flex items-center"
                onClick={handleProgressBarInteraction}
                onPointerDown={(e) => {
                  setIsDraggingProgress(true);
                  handleProgressBarInteraction(e);
                }}
              >
                <div className="w-full h-1 bg-white/20 rounded-full group-hover/progress:h-1.5 transition-all overflow-hidden">
                  <div
                    className="h-full bg-white/30 absolute left-0 top-0"
                    style={{ width: `${buffered}%` }}
                  />
                  <div
                    className="h-full bg-brand absolute left-0 top-0"
                    style={{ width: `${displayProgress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            {/* LEFT CONTROLS */}
            <div className="flex items-center gap-4">
              <button
                onClick={isStreamEnded ? handleReplay : togglePlay}
                className="cursor-pointer text-white hover:text-brand transition-colors focus:outline-none"
                aria-label={isStreamEnded ? "Replay" : isPlaying ? "Pause" : "Play"}
              >
                {isStreamEnded ? (
                  <RotateCcw className="w-7 h-7" />
                ) : isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current" />
                )}
              </button>

              <div className="flex items-center gap-3 text-white">
                {isLive ? (
                  <div className="flex items-center gap-2 px-2 py-0.5 bg-red-600 rounded text-[10px] font-bold tracking-wider">
                    LIVE
                  </div>
                ) : (
                  <div className="text-xs font-medium tabular-nums text-zinc-300">
                    <span>{formatTime(currentTime)}</span>
                    <span className="mx-1.5 text-zinc-500">/</span>
                    <span>{formatTime(displayDuration)}</span>
                  </div>
                )}
              </div>

              {/* VOLUME */}
              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="cursor-pointer text-white hover:text-brand transition-colors"
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
                <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                  <div
                    ref={volumeRef}
                    className="h-1 w-16 bg-white/20 rounded-full ml-1 cursor-pointer relative"
                    onPointerDown={(e) => {
                      setIsDraggingVolume(true);
                      handleVolumeBarInteraction(e);
                    }}
                    onClick={handleVolumeBarInteraction}
                  >
                    <div
                      className="h-full bg-white rounded-full relative"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover/volume:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CONTROLS */}
            <div className="flex items-center gap-1">
              {isFullscreen && showChatOption && (
                <button
                  onClick={() => setShowChatOverlay(!showChatOverlay)}
                  className={`cursor-pointer transition-colors p-2 rounded hover:bg-white/10 ${showChatOverlay ? "text-brand" : "text-white"}`}
                  aria-label={showChatOverlay ? "Hide chat" : "Show chat"}
                >
                  {showChatOverlay ? (
                    <MessageSquare className="w-5 h-5" />
                  ) : (
                    <MessageSquareOff className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* QUALITY SELECTOR */}
              <button
                onClick={toggleQualityMenu}
                type="button"
                className="relative cursor-pointer "
              >
                <div
                  className="text-white hover:text-brand transition-colors p-2 rounded hover:bg-white/10 flex items-center gap-1.5"
                  aria-label="Quality settings"
                >
                  <Settings
                    className={`w-5 h-5 transition-transform duration-300 ${showQualityMenu ? "rotate-90" : ""}`}
                  />
                  <span className="text-[11px] font-medium text-zinc-300 hidden sm:inline">
                    {getQualityLabel()}
                  </span>
                </div>

                {showQualityMenu && availableQualities.length > 0 && (
                  <div className="quality-menu bg-zinc-700 dark:bg-zinc-300">
                    <div className="quality-menu-header">Quality</div>
                    <button
                      className={`quality-menu-item ${isAutoQuality ? "active" : ""}`}
                      onPointerDown={() => {
                        setQuality(-1);
                        setShowQualityMenu(false);
                      }}
                    >
                      <span>Auto</span>
                      {isAutoQuality && (
                        <Check className="w-3.5 h-3.5 text-brand" />
                      )}
                    </button>
                    {availableQualities.map((q) => (
                      <button
                        key={q.index}
                        className={`quality-menu-item ${
                          !isAutoQuality && activeQualityIndex === q.index
                            ? "active"
                            : ""
                        }`}
                        onPointerDown={() => {
                          setQuality(q.index);
                          setShowQualityMenu(false);
                        }}
                      >
                        <span>{q.label}</span>
                        {!isAutoQuality && activeQualityIndex === q.index && (
                          <Check className="w-3.5 h-3.5 text-brand" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </button>

              {/* THEATER MODE */}
              {onTheaterToggle && !isFullscreen && (
                <button
                  onClick={onTheaterToggle}
                  className={`cursor-pointer hidden md:flex text-white hover:text-brand transition-colors p-2 rounded hover:bg-white/10 ${
                    isTheaterMode ? "text-brand" : ""
                  }`}
                  aria-label={
                    isTheaterMode ? "Exit theater mode" : "Theater mode"
                  }
                >
                  {isTheaterMode ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* FULLSCREEN */}
              <button
                onClick={toggleFullscreen}
                className="cursor-pointer text-white hover:text-brand transition-colors p-2 rounded hover:bg-white/10"
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

      {/* FULLSCREEN CHAT OVERLAY */}
      {isFullscreen && showChatOverlay && showChatOption && (
        <LiveChat
          streamId={streamId}
          isLive={isLive}
          mode="overlay"
          currentTimeMs={Math.floor(currentTime * 1000)}
        />
      )}
    </div>
  );
};

export default memo(VideoPlayer);
