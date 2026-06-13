"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { QueryOptions } from "@/lib/react-query/type";

export const QUERY_OPTIONS: Record<string, QueryOptions> = {
  USER_PROFILE: {
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },
};

export const QUERY_KEYS = {
  USER_PROFILE: "user-profile",
  USER_EXTENSIONS: "user-extensions",

  GIFTS: "gifts",
  GIFT_STATS: "gift-stats",
  GIFT_DETAIL: "gift-detail",

  HISTORIES: "histories",
  HISTORY_STATS: "history-stats",

  STREAMS: "streams",
  STREAM_MANAGER_LIST: "stream-manager-list",
  STREAM_KEY: "stream-key",
} as const;

export const useAppQueryClient = () => {
  const queryClient = useQueryClient();

  const invalidateProfile = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
  };

  const removeQueryProfile = () => {
    queryClient.removeQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
  };

  const invalidateProfileExtensions = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.USER_EXTENSIONS],
    });
  };

  const invalidateGifts = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.GIFTS],
    });
  };

  const invalidateGiftDetail = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.GIFT_DETAIL],
    });
  };

  const invalidateGiftStats = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.GIFT_STATS],
    });
  };

  const invalidateHistories = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.HISTORIES],
    });
  };

  const invalidateHistoryStats = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.HISTORY_STATS],
    });
  };

  const invalidateStreams = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.STREAMS],
    });
  };

  const invalidateStreamManagerList = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.STREAM_MANAGER_LIST],
    });
  };

  const refreshGiftDashboard = () => {
    invalidateGifts();
    invalidateGiftStats();
    invalidateGiftDetail();
  };

  const refreshHistoryDashboard = () => {
    invalidateHistories();
    invalidateHistoryStats();
  };

  const clearAll = () => {
    queryClient.clear();
  };

  return {
    queryClient,

    clearAll,

    invalidateProfile,
    removeQueryProfile,
    invalidateProfileExtensions,

    invalidateGifts,

    invalidateGiftStats,

    refreshGiftDashboard,

    invalidateGiftDetail,

    invalidateHistories,

    invalidateHistoryStats,

    refreshHistoryDashboard,

    invalidateStreams,
    invalidateStreamManagerList,
  };
};
