"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { MediaPlayerClass, MediaPlayerEvents } from "dashjs";

export interface QualityOption {
  index: number;
  label: string;
  bitrate: number;
  width: number;
  height: number;
}

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
  const playerRef = useRef<MediaPlayerClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [availableQualities, setAvailableQualities] = useState<QualityOption[]>(
    [],
  );
  const [isAutoQuality, setIsAutoQuality] = useState(true);
  const [activeQualityIndex, setActiveQualityIndex] = useState(0);

  const onMutedAutoplayRef = useRef(onMutedAutoplay);
  onMutedAutoplayRef.current = onMutedAutoplay;

  const isLiveRef = useRef(isLive);
  isLiveRef.current = isLive;
  const autoPlayRef = useRef(autoPlay);
  autoPlayRef.current = autoPlay;

  // Track highest currentTime to prevent backward seeking during live
  const maxTimeRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let destroyed = false;

    const initPlayer = async () => {
      try {
        const dashjsModule = (await import("dashjs")) as any;
        const dashjs = dashjsModule.default || dashjsModule;
        if (destroyed) return;

        setHasError(false);
        setErrorMessage("");
        setIsLoading(true);
        setIsOffline(false);
        setAvailableQualities([]);
        setIsAutoQuality(true);
        setActiveQualityIndex(0);
        maxTimeRef.current = 0;

        const player = dashjs.MediaPlayer().create() as MediaPlayerClass;
        playerRef.current = player;

        if (isLiveRef.current) {
          player.updateSettings({
            streaming: {
              abr: {
                autoSwitchBitrate: { video: true, audio: false },
              },
              delay: {
                liveDelay: 6,
              },

              liveCatchup: {
                enabled: true,
                maxDrift: 12,
                playbackRate: { min: -0.5, max: 0.5 },
              },

              buffer: {
                bufferTimeAtTopQuality: 16,
                bufferToKeep: 30,
              },

              gaps: {
                jumpGaps: true,
                jumpLargeGaps: true,
                smallGapLimit: 0.8,
              },

              retryAttempts: {
                MPD: 20,
                MediaSegment: 10,
              },

              retryIntervals: {
                MPD: 500,
                MediaSegment: 1000,
              },

              utcSynchronization: {
                enabled: true,
                useManifestDateHeaderTimeSource: true,
              },
            },
          });
        } else {
          player.updateSettings({
            streaming: {
              buffer: { bufferTimeAtTopQuality: 30, bufferToKeep: 60 },
              gaps: { jumpGaps: true, jumpLargeGaps: true, smallGapLimit: 1.5 },
              retryAttempts: { MediaSegment: 3 },
              abr: { autoSwitchBitrate: { video: true } },
            },
          });
        }

        const parsed = new URL(url, window.location.origin);
        const st = parsed.searchParams.get("st");
        const e = parsed.searchParams.get("e");

        if (st && e) {
          player.addRequestInterceptor((request: any) => {
            const originalUrl = request.url;
            try {
              const u = new URL(originalUrl, window.location.origin);
              if (!u.searchParams.has("st")) u.searchParams.set("st", st);
              if (!u.searchParams.has("e")) u.searchParams.set("e", e);
              request.url = u.toString();
            } catch {
              const sep = originalUrl.indexOf("?") > -1 ? "&" : "?";
              request.url = `${originalUrl}${sep}st=${st}&e=${e}`;
            }
            return request;
          });
        }

        const dashEvents = dashjs.MediaPlayer.events as MediaPlayerEvents;

        const extractQualities = () => {
          if (destroyed) return;
          try {
            let qualities: QualityOption[] = [];
            const reps = player.getRepresentationsByType("video");

            if (reps?.length) {
              qualities = reps.map((rep: any, index: number) => ({
                index,
                label: rep.height
                  ? `${rep.height}p`
                  : `${Math.round((rep.bandwidth || 0) / 1000)}k`,
                bitrate: rep.bandwidth || 0,
                width: rep.width || 0,
                height: rep.height || 0,
              }));
            } else {
              const videoTracks = player.getTracksFor("video");
              if (!videoTracks?.length) return;
              const bitrateList = videoTracks[0].bitrateList;
              if (!bitrateList?.length) return;
              qualities = bitrateList.map((info: any, index: number) => ({
                index,
                label: info.height
                  ? `${info.height}p`
                  : `${Math.round((info.bandwidth || info.bitrate || 0) / 1000)}k`,
                bitrate: info.bandwidth || info.bitrate || 0,
                width: info.width || 0,
                height: info.height || 0,
              }));
            }

            if (!qualities.length) return;
            const seen = new Map<number, QualityOption>();
            for (const q of qualities) {
              const existing = seen.get(q.height);
              if (!existing || q.bitrate > existing.bitrate)
                seen.set(q.height, q);
            }
            const unique = Array.from(seen.values()).sort(
              (a, b) => b.height - a.height,
            );
            setAvailableQualities((prev) =>
              prev.length === 0 ? unique : prev,
            );
          } catch (err) {
            console.warn("[useDash] extractQualities failed:", err);
          }
        };

        if (isLiveRef.current) {
          const onSeeking = () => {
            if (destroyed || !video) return;
            const ct = video.currentTime;
            if (ct > maxTimeRef.current) {
              maxTimeRef.current = ct;
            } else if (maxTimeRef.current - ct > 2) {
              console.warn(
                `[useDash] Blocked backward seek: ${ct.toFixed(1)}s -> ${maxTimeRef.current.toFixed(1)}s`,
              );
              video.currentTime = maxTimeRef.current;
            }
          };
          video.addEventListener("seeking", onSeeking);
          video.addEventListener("timeupdate", () => {
            if (video.currentTime > maxTimeRef.current) {
              maxTimeRef.current = video.currentTime;
            }
          });
        }

        player.on(dashEvents.CAN_PLAY, () => {
          if (destroyed) return;
          setIsLoading(false);
          extractQualities();
        });

        player.on(dashEvents.PLAYBACK_PLAYING, () => {
          if (destroyed) return;
          setIsLoading(false);
          setIsOffline(false);
          extractQualities();
        });

        player.on(dashEvents.BUFFER_EMPTY, () => {
          if (destroyed) return;
          setIsLoading(true);
        });

        player.on(dashEvents.BUFFER_LOADED, () => {
          if (destroyed) return;
          setIsLoading(false);
        });

        player.on(dashEvents.STREAM_INITIALIZED, () => {
          if (destroyed) return;
          extractQualities();
          if (autoPlayRef.current) {
            video.muted = true;
            onMutedAutoplayRef.current?.();
            video.play().catch(() => {});
          }
        });

        // === Debug: Log manifest info ===
        player.on(dashEvents.MANIFEST_LOADED, (ev: any) => {
          if (destroyed) return;
          console.log("[useDash] Manifest loaded", {
            type: ev?.data?.type,
            availabilityStartTime: ev?.data?.availabilityStartTime,
            publishTime: ev?.data?.publishTime,
            browserTime: new Date().toISOString(),
          });
        });

        player.on(dashEvents.ERROR, (ev: any) => {
          if (destroyed) return;
          console.error("[useDash] Error:", ev?.error, ev?.event);

          if (ev.error === "capability" && ev.event === "mediasource") {
            setHasError(true);
            setErrorMessage("Media Source Extensions not supported.");
            setIsLoading(false);
            return;
          }
          // Let dash.js handle ALL retries internally.
          // Do NOT set offline or restart - dash.js v5 manages this.
        });

        player.initialize(video, url, autoPlayRef.current);
      } catch (error: any) {
        if (destroyed) return;
        setHasError(true);
        setErrorMessage(error?.message || "Failed to initialize player");
        setIsLoading(false);
      }
    };

    initPlayer();

    return () => {
      destroyed = true;
      if (playerRef.current) {
        try {
          playerRef.current.reset();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [url, videoRef]);

  const setQuality = useCallback((qualityIndex: number) => {
    const player = playerRef.current;
    if (!player) return;

    const isAuto = qualityIndex === -1;
    player.updateSettings({
      streaming: { abr: { autoSwitchBitrate: { video: isAuto } } },
    });

    if (!isAuto) {
      player.setRepresentationForTypeByIndex("video", qualityIndex, true);
    }

    setIsAutoQuality(isAuto);
    if (!isAuto) setActiveQualityIndex(qualityIndex);
  }, []);

  const seekTo = useCallback(
    (time: number) => {
      const player = playerRef.current;
      if (!player) return;
      if (isLiveRef.current && time < maxTimeRef.current) {
        console.warn("[useDash] Blocked backward seekTo during live");
        return;
      }
      try {
        player.seek(time);
      } catch {
        if (videoRef.current) videoRef.current.currentTime = time;
      }
    },
    [videoRef],
  );

  return {
    playerRef,
    isLoading,
    hasError,
    errorMessage,
    isOffline,
    availableQualities,
    isAutoQuality,
    activeQualityIndex,
    setQuality,
    seekTo,
  };
}
