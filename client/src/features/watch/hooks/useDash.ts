"use client";

import { useRef, useEffect, useState } from "react";

interface UseDashProps {
  url: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  autoPlay?: boolean;
  isLive?: boolean;
  onMutedAutoplay?: () => void;
}

export function useDash({
  url,
  videoRef,
  autoPlay = true,
  isLive = false,
  onMutedAutoplay,
}: UseDashProps) {
  const playerRef = useRef<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  const onMutedAutoplayRef = useRef(onMutedAutoplay);
  onMutedAutoplayRef.current = onMutedAutoplay;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let player: any = null;
    let initializationAttempted = false;

    const initPlayer = async () => {
      if (initializationAttempted) return;
      initializationAttempted = true;

      try {
        const dashjsModule = (await import("dashjs")) as any;
        const dashjs = dashjsModule.default || dashjsModule;

        setHasError(false);
        setErrorMessage("");
        setIsLoading(true);
        setIsOffline(false);

        player = dashjs.MediaPlayer().create();
        playerRef.current = player;

        if (isLive) {
          player.updateSettings({
            debug: {
              logLevel: dashjs.Debug.LOG_LEVEL_WARN,
            },
            streaming: {
              manifestUpdateRetryInterval: 2,

              delay: {
                liveDelay: 8,
              },

              liveCatchup: {
                enabled: false,
              },

              buffer: {
                stableBufferTime: 12,
                bufferTimeAtTopQuality: 15,
                bufferPruningInterval: 10,
                bufferToKeep: 20,
              },

              retryAttempts: {
                MPD: 5,
                MediaSegment: 3,
              },

              retryIntervals: {
                MPD: 1000,
                MediaSegment: 1000,
              },
            },
          });
        } else {
          player.updateSettings({
            streaming: {
              buffer: {
                stableBufferTime: 12,
                bufferTimeAtTopQuality: 15,
              },
              retryAttempts: {
                MPD: 3,
                MediaSegment: 3,
              },
            },
          });
        }

        player.initialize(video, url, autoPlay);

        player.on(dashjs.MediaPlayer.events.CAN_PLAY, () => {
          console.log("✅ DASH: CAN_PLAY");
          setIsLoading(false);
        });

        player.on(dashjs.MediaPlayer.events.PLAYBACK_PLAYING, () => {
          console.log("▶️  DASH: PLAYING");
          setIsLoading(false);
          setIsOffline(false);
        });

        player.on(dashjs.MediaPlayer.events.PLAYBACK_WAITING, () => {
          console.log("⏸️  DASH: WAITING (buffering)");
        });

        player.on(dashjs.MediaPlayer.events.PLAYBACK_STALLED, () => {
          console.warn("⚠️  DASH: STALLED");
        });

        player.on(dashjs.MediaPlayer.events.BUFFER_EMPTY, (e: any) => {
          console.warn("📭 DASH: Buffer empty", e.mediaType);
        });

        player.on(dashjs.MediaPlayer.events.BUFFER_LOADED, (e: any) => {
          console.log("📦 DASH: Buffer loaded", e.mediaType);
        });

        player.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, (e: any) => {
          console.log("📄 DASH: Manifest loaded", {
            type: e.data?.type,
            isLive: e.data?.type === "dynamic",
          });
        });

        player.on(dashjs.MediaPlayer.events.MANIFEST_VALIDITY_CHANGED, () => {
          console.log("🔄 DASH: Manifest refreshed");
        });

        player.on(dashjs.MediaPlayer.events.ERROR, (e: any) => {
          console.error("❌ DASH Error:", e);

          if (e.error === "capability" && e.event === "mediasource") {
            setHasError(true);
            setErrorMessage("MSE not supported");
            setIsLoading(false);
            return;
          }

          if (e.error === "download" && e.event?.request?.type === "MPD") {
            console.error("Manifest download failed");
            setIsOffline(true);
            setIsLoading(false);
            return;
          }

          if (
            e.error === "download" &&
            e.event?.request?.type === "MediaSegment"
          ) {
            console.warn("Segment download failed, will retry");
            return;
          }

          if (e.error && e.error !== "key") {
            setIsOffline(true);
            setIsLoading(false);
          }
        });

        player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
          console.log("🎬 DASH: Stream initialized");

          if (autoPlay) {
            video.play().catch((playError) => {
              console.log("Autoplay blocked, trying muted");
              video.muted = true;
              onMutedAutoplayRef.current?.();
              video.play().catch((e) => {
                console.error("Muted autoplay failed:", e);
              });
            });
          }
        });
      } catch (error: any) {
        console.error("DASH initialization error:", error);
        setHasError(true);
        setErrorMessage(error.message || "Failed to initialize player");
        setIsLoading(false);
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        console.log("Cleaning up DASH player");
        try {
          playerRef.current.reset();
        } catch (e) {
          console.error("Error cleaning up player:", e);
        }
        playerRef.current = null;
      }
      initializationAttempted = false;
    };
  }, [autoPlay, videoRef, url, isLive]);

  return {
    playerRef,
    isLoading,
    hasError,
    errorMessage,
    isOffline,
  };
}
