"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
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
  streamId: string;
  onMutedAutoplay?: () => void;
  onEnded?: () => void;
}

export function useDash({
  url,
  videoRef,
  autoPlay = true,
  isLive = false,
  streamId,
  onMutedAutoplay,
  onEnded,
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
  const currentUrlRef = useRef<string>(url);

  const onMutedAutoplayRef = useRef(onMutedAutoplay);
  onMutedAutoplayRef.current = onMutedAutoplay;
  const isLiveRef = useRef(isLive);
  isLiveRef.current = isLive;
  const autoPlayRef = useRef(autoPlay);
  const onEndedRef = useRef(onEnded);
  autoPlayRef.current = autoPlay;
  const maxTimeRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentUrlRef.current) return;

    let destroyed = false;
    const dashEventsList: { name: string; handler: any }[] = [];

    const initPlayer = async () => {
      try {
        const dashjsModule = (await import("dashjs")) as any;
        const dashjs = dashjsModule.default || dashjsModule;
        if (destroyed) return;

        // Reset states
        setHasError(false);
        setErrorMessage("");
        setIsLoading(true);
        setIsOffline(false);
        maxTimeRef.current = 0;

        const player = dashjs.MediaPlayer().create() as MediaPlayerClass;
        playerRef.current = player;

        // Cấu hình tối ưu cho Live/VOD
        player.updateSettings({
          streaming: {
            abr: { autoSwitchBitrate: { video: true, audio: false } },
            buffer: {
              bufferTimeAtTopQuality: isLiveRef.current ? 16 : 30,
              bufferToKeep: isLiveRef.current ? 30 : 60,
            },
            gaps: { jumpGaps: true, jumpLargeGaps: true, smallGapLimit: 0.8 },
            retryAttempts: { MPD: 20, MediaSegment: 10 },
          },
        });

        const parsed = new URL(currentUrlRef.current, window.location.origin);
        const st = parsed.searchParams.get("st");
        const e = parsed.searchParams.get("e");

        if (st && e) {
          let isRefreshing = false;
          let refreshPromise: Promise<string> | null = null;

          player.addRequestInterceptor(async (request: any) => {
            const u = new URL(request.url, window.location.origin);
            const parsedCurrent = new URL(
              currentUrlRef.current,
              window.location.origin,
            );

            let currentE = Number(parsedCurrent.searchParams.get("e"));
            const nowInSeconds = Math.floor(Date.now() / 1000);

            if (currentE && currentE - nowInSeconds <= 60) {
              if (!isRefreshing) {
                isRefreshing = true;

                refreshPromise = (async () => {
                  try {
                    const res = await fetch(
                      `${process.env.NEXT_PUBLIC_BASE_URL}/stream/${streamId}/session`,
                    );
                    const json = await res.json();
                    isRefreshing = false;

                    return json.data.manifestUrl as string;
                  } catch {
                    return currentUrlRef.current;
                  }
                })();
              }

              const refreshedUrlStr = await refreshPromise;
              currentUrlRef.current = refreshedUrlStr as string;
            }

            const updatedParsed = new URL(
              currentUrlRef.current,
              window.location.origin,
            );
            const newSt = updatedParsed.searchParams.get("st");
            const newE = updatedParsed.searchParams.get("e");

            if (newSt) u.searchParams.set("st", newSt);
            if (newE) u.searchParams.set("e", newE);

            request.url = u.toString();
            return request;
          });
        }

        const extractQualities = () => {
          if (destroyed) return;
          const reps = player.getRepresentationsByType("video");
          if (!reps?.length) return;

          const uniqueQualities = Array.from(
            new Map(
              reps.map((rep: any, idx: number) => [
                rep.height,
                {
                  index: idx,
                  label: rep.height
                    ? `${rep.height}p`
                    : `${Math.round(rep.bandwidth / 1000)}k`,
                  bitrate: rep.bandwidth || 0,
                  width: rep.width || 0,
                  height: rep.height || 0,
                },
              ]),
            ).values(),
          ).sort((a, b) => b.height - a.height);

          setAvailableQualities((prev) =>
            JSON.stringify(prev) === JSON.stringify(uniqueQualities)
              ? prev
              : uniqueQualities,
          );
        };

        const dashEvents = dashjs.MediaPlayer.events as MediaPlayerEvents;
        const listen = (name: string, cb: any) => {
          player.on(name, cb);
          dashEventsList.push({ name, handler: cb });
        };

        listen(dashEvents.CAN_PLAY, () => {
          setIsLoading(false);
          extractQualities();
        });

        listen(dashEvents.STREAM_INITIALIZED, () => {
          extractQualities();
          if (autoPlayRef.current) {
            video.muted = true;
            onMutedAutoplayRef.current?.();
            video.play().catch(() => {});
          }
        });

        listen(dashEvents.BUFFER_EMPTY, () => setIsLoading(true));
        listen(dashEvents.BUFFER_LOADED, () => setIsLoading(false));

        listen(dashEvents.PLAYBACK_ENDED, () => {
          if (destroyed) return;
          onEndedRef.current?.();
        });

        listen(dashEvents.ERROR, (ev: any) => {
          if (destroyed) return;
          console.error("[useDash] Error:", ev);
          if (ev.error === "capability") {
            setHasError(true);
            setErrorMessage("Trình duyệt không hỗ trợ định dạng này.");
          }
        });

        player.initialize(video, currentUrlRef.current, autoPlayRef.current);
      } catch (error: any) {
        if (destroyed) return;
        setHasError(true);
        setErrorMessage("Không thể khởi tạo trình phát video.");
      }
    };

    const onSeeking = () => {
      if (!isLiveRef.current) return;
      const ct = video.currentTime;
      if (ct > maxTimeRef.current) {
        maxTimeRef.current = ct;
      } else if (maxTimeRef.current - ct > 2) {
        video.currentTime = maxTimeRef.current;
      }
    };

    const onTimeUpdate = () => {
      if (video.currentTime > maxTimeRef.current) {
        maxTimeRef.current = video.currentTime;
      }
    };

    video.addEventListener("seeking", onSeeking);
    video.addEventListener("timeupdate", onTimeUpdate);

    initPlayer();

    return () => {
      destroyed = true;
      video.removeEventListener("seeking", onSeeking);
      video.removeEventListener("timeupdate", onTimeUpdate);

      if (playerRef.current) {
        dashEventsList.forEach(({ name, handler }) =>
          playerRef.current?.off(name, handler),
        );
        playerRef.current.reset();
        playerRef.current = null;
      }
    };
  }, [currentUrlRef.current, videoRef]);

  const setQuality = useCallback((qualityIndex: number) => {
    const player = playerRef.current;
    if (!player) return;

    const isAuto = qualityIndex === -1;
    player.updateSettings({
      streaming: { abr: { autoSwitchBitrate: { video: isAuto } } },
    });

    if (!isAuto) {
      player.setRepresentationForTypeByIndex("video", qualityIndex, true);
      setActiveQualityIndex(qualityIndex);
    }
    setIsAutoQuality(isAuto);
  }, []);

  const seekTo = useCallback(
    (time: number) => {
      if (isLiveRef.current && time < maxTimeRef.current) return;
      if (playerRef.current) {
        playerRef.current.seek(time);
      } else if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    [videoRef],
  );

  return useMemo(
    () => ({
      isLoading,
      hasError,
      errorMessage,
      isOffline,
      availableQualities,
      isAutoQuality,
      activeQualityIndex,
      setQuality,
      seekTo,
    }),
    [
      isLoading,
      hasError,
      errorMessage,
      isOffline,
      availableQualities,
      isAutoQuality,
      activeQualityIndex,
      setQuality,
      seekTo,
    ],
  );
}
