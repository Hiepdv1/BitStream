"use client";
import { useState, useEffect, useCallback, RefObject } from "react";

const VOLUME_STORAGE_KEY = "bitstream_player_volume";
const MUTED_STORAGE_KEY = "bitstream_player_muted";

export function usePlayerState(videoRef: RefObject<HTMLVideoElement | null>) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
    const savedMuted = localStorage.getItem(MUTED_STORAGE_KEY);

    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
    }

    if (savedMuted === "true") {
      setIsMuted(true);
    }

    setIsStorageLoaded(true);
  }, []);

  useEffect(() => {
    if (!isStorageLoaded || typeof window === "undefined") return;

    localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString());
    localStorage.setItem(MUTED_STORAGE_KEY, isMuted.toString());

    const video = videoRef.current;
    if (video) {
      video.volume = isMuted ? 0 : volume;
      video.muted = isMuted;
    }
  }, [volume, isMuted, videoRef, isStorageLoaded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (isFinite(video.duration) && video.duration > 0) {
        console.log(video.currentTime / video.duration);
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const onDurationChange = () => {
      const dur = video.duration;
      if (isFinite(dur)) {
        setDuration(dur);
      }
    };

    const onProgress = () => {
      if (video.buffered.length > 0 && video.duration > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

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

    if (video.paused) {
      video.play().catch((err) => {
        console.error("Play failed:", err);
      });
    } else {
      video.pause();
    }
  }, [videoRef]);

  const handleSeek = useCallback(
    (pos: number) => {
      const video = videoRef.current;
      if (!video || !isFinite(video.duration) || video.duration === 0) return;

      const newTime = pos * video.duration;
      if (isFinite(newTime)) {
        video.currentTime = newTime;
      }
    },
    [videoRef],
  );

  return {
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
    setIsFullscreen,
    togglePlay,
    handleSeek,
  };
}
