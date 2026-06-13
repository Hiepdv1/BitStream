"use client";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  RefObject,
  useMemo,
} from "react";

const VOLUME_STORAGE_KEY = "bitstream_player_volume";
const MUTED_STORAGE_KEY = "bitstream_player_muted";
const TIME_UPDATE_THROTTLE_MS = 1000;
const PROGRESS_THROTTLE_MS = 1000;

export function usePlayerState(videoRef: RefObject<HTMLVideoElement | null>) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMutedState] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  const lastTimeUpdateRef = useRef(0);
  const lastProgressUpdateRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
    const savedMuted = localStorage.getItem(MUTED_STORAGE_KEY);

    if (savedVolume) setVolumeState(parseFloat(savedVolume));
    if (savedMuted === "true") setIsMutedState(true);

    setIsStorageLoaded(true);
  }, []);

  useEffect(() => {
    if (!isStorageLoaded) return;

    const video = videoRef.current;
    if (video) {
      video.volume = isMuted ? 0 : volume;
      video.muted = isMuted;
    }

    localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString());
    localStorage.setItem(MUTED_STORAGE_KEY, isMuted.toString());
  }, [volume, isMuted, isStorageLoaded, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      const now = performance.now();
      if (now - lastTimeUpdateRef.current < TIME_UPDATE_THROTTLE_MS) return;
      lastTimeUpdateRef.current = now;

      const time = video.currentTime;
      setCurrentTime(time);
      if (video.duration > 0) {
        setProgress((time / video.duration) * 100);
      }
    };

    const onProgress = () => {
      const now = performance.now();
      if (now - lastProgressUpdateRef.current < PROGRESS_THROTTLE_MS) return;
      lastProgressUpdateRef.current = now;

      if (video.buffered.length > 0 && video.duration > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    const onDurationChange = () => {
      if (isFinite(video.duration)) setDuration(video.duration);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("progress", onProgress);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [videoRef]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play().catch(() => {}) : video.pause();
  }, [videoRef]);

  const handleSeek = useCallback(
    (pos: number) => {
      const video = videoRef.current;
      if (!video || !isFinite(video.duration)) return;
      video.currentTime = pos * video.duration;
    },
    [videoRef],
  );

  const setVolume = useCallback((val: number) => {
    setVolumeState(val);
  }, []);

  const setIsMuted = useCallback((val: boolean) => {
    setIsMutedState(val);
  }, []);

  return useMemo(
    () => ({
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
      handleSeek,
    }),
    [
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
      handleSeek,
    ],
  );
}
