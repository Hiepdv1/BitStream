"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  RotateCcw,
  Settings,
  Loader2,
  Radio,
  SkipBack,
  SkipForward,
} from "lucide-react";

interface VideoPlayerProps {
  streamId: string;
  title?: string;
  autoPlay?: boolean;
  isLive?: boolean;
  onError?: (error: string) => void;
}

export function VideoPlayer({
  streamId,
  title,
  autoPlay = true,
  isLive = false,
  onError,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isVOD, setIsVOD] = useState(!isLive);

  const hlsUrl = `http://localhost:8080/hls/${streamId}/index.m3u8`;

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setHasError(false);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: isLive,
        backBufferLength: 90,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
      });

      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setIsLoading(false);
        const isVodPlaylist = data.levels.some(
          (level) => level.details?.live === false
        );
        setIsVOD(!isLive || isVodPlaylist);

        if (autoPlay) {
          video.play().catch(() => {});
        }
      });

      hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
        if (data.details.live === false) {
          setIsVOD(true);
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setHasError(true);
          setIsLoading(false);
          const msg = `Stream error: ${data.type}`;
          setErrorMessage(msg);
          onError?.(msg);

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        if (autoPlay) video.play();
      });
    }
  }, [streamId, hlsUrl, autoPlay, isLive, onError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (isFinite(video.duration) && video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };
    const handleDurationChange = () => {
      if (isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };
    const handleProgress = () => {
      if (video.buffered.length > 0 && isFinite(video.duration)) {
        setBuffered(
          (video.buffered.end(video.buffered.length - 1) / video.duration) * 100
        );
      }
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying && !isHovering) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    } else {
      setShowControls(true);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, isHovering]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "ArrowLeft":
          if (isVOD) {
            e.preventDefault();
            skip(-10);
          }
          break;
        case "ArrowRight":
          if (isVOD) {
            e.preventDefault();
            skip(10);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVOD]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoRef.current;
      if (!video) return;
      const newVolume = parseFloat(e.target.value);
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    },
    []
  );

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isVOD) return;
      const video = videoRef.current;
      const progressBar = progressRef.current;
      if (!video || !progressBar || !isFinite(video.duration)) return;

      const rect = progressBar.getBoundingClientRect();
      const percent = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width)
      );
      video.currentTime = percent * video.duration;
    },
    [isVOD]
  );

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video || !isFinite(video.duration)) return;
    video.currentTime = Math.max(
      0,
      Math.min(video.duration, video.currentTime + seconds)
    );
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const retry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    if (hlsRef.current) {
      hlsRef.current.startLoad();
    }
  }, []);

  const goToLive = useCallback(() => {
    const video = videoRef.current;
    if (!video || !hlsRef.current) return;
    video.currentTime = video.duration;
  }, []);

  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      ref={containerRef}
      className={`video-player-container relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl group ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "aspect-video"
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        playsInline
        onClick={togglePlay}
      />

      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-brand animate-spin" />
              {!isVOD && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <Radio className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <p className="text-white/80 text-sm font-medium">
              {!isVOD ? "Connecting to live stream..." : "Loading video..."}
            </p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center p-6">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
              <RotateCcw className="w-10 h-10 text-red-400" />
            </div>
            <p className="text-white font-semibold text-lg">
              Stream Unavailable
            </p>
            <p className="text-white/60 text-sm max-w-xs">{errorMessage}</p>
            <button
              onClick={retry}
              className="mt-2 px-6 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-medium transition-all hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/60 to-transparent pt-24 pb-4 px-4 sm:px-6 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          ref={progressRef}
          className={`relative h-1 bg-white/20 rounded-full mb-4 transition-all duration-200 ${
            isVOD
              ? "cursor-pointer hover:h-1.5 group/progress"
              : "cursor-default"
          }`}
          onClick={handleSeek}
        >
          <div
            className="absolute inset-y-0 left-0 bg-white/30 rounded-full transition-all"
            style={{ width: `${buffered}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-brand rounded-full transition-all"
            style={{ width: `${isVOD ? progress : 100}%` }}
          />
          {isVOD && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-all scale-0 group-hover/progress:scale-100"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={togglePlay}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-105 active:scale-95"
              title={isPlaying ? "Pause (k)" : "Play (k)"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            {isVOD && (
              <>
                <button
                  onClick={() => skip(-10)}
                  className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                  title="Rewind 10s"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={() => skip(10)}
                  className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                  title="Forward 10s"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </>
            )}

            <div className="flex items-center gap-1 group/volume">
              <button
                onClick={toggleMute}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                title={isMuted ? "Unmute (m)" : "Mute (m)"}
              >
                <VolumeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 accent-brand cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-white/90 text-xs sm:text-sm font-medium tabular-nums ml-1">
              {!isVOD ? (
                <>
                  <button
                    onClick={goToLive}
                    className="flex items-center gap-1.5 px-2 py-1 bg-red-500/90 hover:bg-red-500 rounded-md transition-colors"
                    title="Go to live edge"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    <span className="text-xs font-bold">LIVE</span>
                  </button>
                  <span className="text-white/70">
                    {formatTime(currentTime)}
                  </span>
                </>
              ) : (
                <span>
                  {formatTime(currentTime)}
                  <span className="text-white/50 mx-1">/</span>
                  {formatTime(duration)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {title && (
              <span className="hidden lg:block text-white/60 text-sm truncate max-w-[200px] mr-2">
                {title}
              </span>
            )}

            <button
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              title={isFullscreen ? "Exit fullscreen (f)" : "Fullscreen (f)"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {!isPlaying && !isLoading && !hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand/90 hover:bg-brand flex items-center justify-center shadow-2xl shadow-brand/50 transition-all hover:scale-110 active:scale-95">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" />
          </div>
        </div>
      )}

      {!isVOD && isPlaying && !showControls && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2 py-1 bg-red-500/90 rounded-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="text-white text-xs font-bold">LIVE</span>
        </div>
      )}
    </div>
  );
}
