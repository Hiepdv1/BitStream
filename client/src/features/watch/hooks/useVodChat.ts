"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { useVodHistory } from "./useVodHistory";

const MAX_MESSAGES_BUFFER = 1000;

interface UseVodChatOptions {
  streamId: string;
  currentTimeMs: number;
}

export function useVodChat({ streamId, currentTimeMs }: UseVodChatOptions) {
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);

  const nextOffsetMs = useRef<number | null>(null);
  const hasMoreRef = useRef<boolean>(true);
  const prevTimeRef = useRef<number>(currentTimeMs);
  const isFetchingRef = useRef<boolean>(false);

  const { refetch } = useVodHistory(
    streamId,
    nextOffsetMs.current ?? undefined,
    undefined,
    50,
    {
      enabled: false,
    },
  );

  const loadMore = useCallback(
    async (fromTime: number | null, isSeek: boolean) => {
      if (isFetchingRef.current || (hasMoreRef.current && !isSeek)) return;

      isFetchingRef.current = true;

      nextOffsetMs.current = fromTime;

      const { data: result } = await refetch();

      if (result?.success && result.data) {
        const newBatch = result.data.map(
          (item) =>
            ({
              id: item.id,
              userName: item.user.name,
              message: item.content,
              offsetMs: item.offsetMs,
              userAvatar: item.user.avatar,
              userID: item.user.id,
            }) as ChatMessage,
        );

        setAllMessages((prev) => {
          if (isSeek) return newBatch;

          const combined = [...prev, ...newBatch];

          if (combined.length > MAX_MESSAGES_BUFFER) {
            return combined.slice(-MAX_MESSAGES_BUFFER);
          }

          return combined;
        });

        nextOffsetMs.current = result.meta?.nextOffsetMs ?? null;
        hasMoreRef.current = result.meta?.hasMore ?? false;
      }

      isFetchingRef.current = false;
    },
    [refetch],
  );

  const messages = useMemo(() => {
    return allMessages.filter(
      (msg) => !msg.isDeleted && msg.offsetMs <= currentTimeMs,
    );
  }, [allMessages, currentTimeMs]);

  const didSeekBackward = currentTimeMs < prevTimeRef.current - 1000;

  useEffect(() => {
    if (!streamId) return;
    loadMore(null, true);
  }, [streamId]);

  useEffect(() => {
    const timeDiff = currentTimeMs - prevTimeRef.current;
    const isSeekForward = timeDiff > 3000;
    const isSeekBackward = timeDiff < -1000;

    if (isSeekBackward || isSeekForward) {
      hasMoreRef.current = true;
      nextOffsetMs.current = currentTimeMs;
      loadMore(currentTimeMs, true);
    } else {
      const lastMsgOffset = messages[messages.length - 1]?.offsetMs;
      if (hasMoreRef.current && currentTimeMs > lastMsgOffset - 5000) {
        loadMore(nextOffsetMs.current ?? currentTimeMs, false);
      }
    }

    prevTimeRef.current = currentTimeMs;
  }, [currentTimeMs]);

  return useMemo(
    () => ({
      messages,
      didSeekBackward,
      setAllMessages,
    }),
    [messages, didSeekBackward],
  );
}
