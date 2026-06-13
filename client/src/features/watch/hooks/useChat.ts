"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSocket, WsError } from "./useSocket";
import { BinaryWriter, BinaryReader, Opcode } from "../lib/protocol";
import { ChatMessage, StreamMetrics } from "../types";
import { useLiveHistory } from "@/hooks/useLiveHistory";

interface UseChatOptions {
  streamId: string;
  wsUrl: string;
  enabled?: boolean;
}

export function useChat({ streamId, wsUrl, enabled = false }: UseChatOptions) {
  const { sendPacket, onMessage, isConnected, error } = useSocket({
    url: wsUrl,
    enabled,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pinnedMessage, setPinnedMessage] = useState<ChatMessage | null>(null);
  const [metrics, setMetrics] = useState<StreamMetrics>({
    currentViewers: 0,
    totalViews: 0,
  });

  const {
    data: liveHistory,
    isLoading: isLoadingLiveHistory,
    error: liveHistoryError,
  } = useLiveHistory(streamId);

  const [wsError, setWsError] = useState<WsError | null>(null);

  const joinedRef = useRef(false);

  useEffect(() => {
    if (liveHistory) {
      setMessages(liveHistory.messages);
      setPinnedMessage(liveHistory.pinned);
    }
  }, [liveHistory]);

  useEffect(() => {
    if (error) setWsError(error);
    if (liveHistoryError) setWsError(liveHistoryError);
  }, [error, liveHistoryError]);

  useEffect(() => {
    if (!isConnected) {
      joinedRef.current = false;
      return;
    }

    const joinPacket = BinaryWriter.createPacket(Opcode.JOIN_ROOM);
    joinPacket.writeString8(streamId);
    sendPacket(joinPacket);
    joinedRef.current = true;

    const timer = setInterval(
      () => {
        const hbPacket = BinaryWriter.createPacket(Opcode.STREAM_HEARTBEAT);
        hbPacket.writeString8(streamId);
        sendPacket(hbPacket);
      },
      10000 + Math.floor(Math.random() * 10000),
    );

    return () => clearInterval(timer);
  }, [isConnected, streamId, sendPacket, isLoadingLiveHistory]);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onMessage((opcode: number, reader: BinaryReader) => {
      switch (opcode) {
        case Opcode.STREAM_METRICS:
          handleMetrics(reader);
          break;
        case Opcode.STREAM_MESSAGE:
          handleNewMessage(reader);
          break;
        case Opcode.MSG_PIN:
        case Opcode.MSG_UNPIN:
          handleUpdateMessageStatus(reader, opcode);
          break;
        case Opcode.MSG_DELETE:
          handleOnDeleteMessage(reader);
          break;
      }
    });

    return unsubscribe;
  }, [isConnected, onMessage, streamId]);

  const handleMetrics = (reader: BinaryReader) => {
    try {
      const sId = reader.readString8();
      if (sId !== streamId) return;

      const currentViewers = reader.readUint32BE();
      const totalViews = reader.readUint32BE();
      setMetrics({ currentViewers, totalViews });
    } catch (e) {
      console.error("Metrics parse error", e);
    }
  };

  const handleNewMessage = (reader: BinaryReader) => {
    try {
      const msgID = reader.readString8();
      const userID = reader.readString8();
      const userName = reader.readString8();
      const userAvatar = reader.readString8();
      const message = reader.readString8();
      const offsetMs = reader.readUint32BE();

      const chatMsg: ChatMessage = {
        id: msgID,
        userID,
        userName,
        userAvatar,
        message,
        offsetMs,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const next = [...prev, chatMsg];
        return next.length > 30 ? next.slice(-30) : next;
      });
    } catch (e) {
      console.error("Message parse error", e);
    }
  };

  const handleUpdateMessageStatus = (
    reader: BinaryReader,
    opcode: Opcode.MSG_PIN | Opcode.MSG_UNPIN,
  ) => {
    try {
      const streamID = reader.readString8();
      const messageID = reader.readString8();
      const isPinned = opcode === Opcode.MSG_PIN;

      if (streamID !== streamId) return;

      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageID ? { ...msg, isPinned } : msg)),
      );
    } catch (e) {
      console.error("Update message status parse error", e);
    }
  };

  const clearError = useCallback(() => {
    setWsError(null);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!isConnected || !text.trim()) return;
      const writer = BinaryWriter.createPacket(Opcode.MSG_TEXT);
      writer.writeString8(streamId);
      writer.writeString8(text.trim());
      sendPacket(writer);
    },
    [isConnected, streamId, sendPacket],
  );

  const handleOnDeleteMessage = useCallback(
    (reader: BinaryReader) => {
      try {
        const streamID = reader.readString8();
        const messageID = reader.readString8();

        if (streamID !== streamId) return;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageID ? { ...msg, isDeleted: true } : msg,
          ),
        );
      } catch (e) {
        console.error("Delete message parse error", e);
      }
    },
    [streamId, setMessages],
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      const target = messages.find((msg) => msg.id === messageId);

      if (!target) return;
      if (target.isDeleted) return;

      if (target.isPinned) {
        setPinnedMessage(null);
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isDeleted: true } : msg,
        ),
      );
      const writer = BinaryWriter.createPacket(Opcode.MSG_DELETE);
      writer.writeString8(streamId);
      writer.writeString8(messageId);
      sendPacket(writer);
    },
    [messages, sendPacket],
  );

  const pinMessage = useCallback(
    (messageId: string) => {
      const target = messages.find((msg) => msg.id === messageId);
      if (target) {
        setPinnedMessage({ ...target, isPinned: true });
      }
      const writer = BinaryWriter.createPacket(Opcode.MSG_PIN);
      writer.writeString8(streamId);
      writer.writeString8(messageId);
      writer.writeBool(true);
      sendPacket(writer);
    },
    [messages, sendPacket],
  );

  const unpinMessage = useCallback(
    (messageID: string) => {
      const target = messages.find((msg) => msg.id === messageID);
      if (!target) return;
      setPinnedMessage(null);
      const writer = BinaryWriter.createPacket(Opcode.MSG_UNPIN);
      writer.writeString8(streamId);
      writer.writeString8(messageID);
      writer.writeBool(false);
      sendPacket(writer);
    },
    [messages, sendPacket],
  );

  return useMemo(
    () => ({
      messages,
      pinnedMessage,
      sendMessage,
      deleteMessage,
      pinMessage,
      unpinMessage,
      isConnected,
      error: wsError,
      metrics,
      clearError,
    }),
    [
      messages,
      pinnedMessage,
      sendMessage,
      deleteMessage,
      pinMessage,
      unpinMessage,
      isConnected,
      wsError,
      metrics,
    ],
  );
}
