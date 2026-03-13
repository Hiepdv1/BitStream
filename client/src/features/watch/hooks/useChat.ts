"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket, WsError } from "./useSocket";
import { BinaryWriter, BinaryReader, Opcode } from "../lib/protocol";

export interface ChatMessage {
  id: string;
  userID: string;
  message: string;
  offsetMs: number;
  timestamp: Date;
  color: string;
}

const USER_COLORS = [
  "#a78bfa",
  "#f472b6",
  "#4ade80",
  "#60a5fa",
  "#fbbf24",
  "#fb923c",
  "#e879f9",
  "#34d399",
  "#f87171",
  "#38bdf8",
];

function getUserColor(userID: string): string {
  let hash = 0;
  for (let i = 0; i < userID.length; i++) {
    hash = (hash * 31 + userID.charCodeAt(i)) | 0;
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

interface UseChatOptions {
  streamId: string;
  wsUrl: string;
  enabled?: boolean;
}

export function useChat({ streamId, wsUrl, enabled = true }: UseChatOptions) {
  const { sendPacket, onMessage, isConnected, error } = useSocket({
    url: wsUrl,
    enabled,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [wsError, setWsError] = useState<WsError | null>(null);
  const joinedRef = useRef(false);
  const idCounter = useRef(0);

  useEffect(() => {
    if (error) setWsError(error);
  }, [error]);

  useEffect(() => {
    if (!isConnected || joinedRef.current) return;

    const writer = BinaryWriter.createPacket(Opcode.JOIN_ROOM);
    writer.writeString8(streamId);
    sendPacket(writer);
    joinedRef.current = true;
  }, [isConnected, streamId, sendPacket]);

  useEffect(() => {
    joinedRef.current = false;
  }, [streamId]);

  useEffect(() => {
    const unsubscribe = onMessage((opcode: number, reader: BinaryReader) => {
      if (opcode === Opcode.STREAM_MESSAGE) {
        try {
          const userID = reader.readString8();
          const message = reader.readString8();
          const offsetMs = reader.readUint32BE();

          const chatMsg: ChatMessage = {
            id: `msg-${Date.now()}-${++idCounter.current}`,
            userID,
            message,
            offsetMs,
            timestamp: new Date(),
            color: getUserColor(userID),
          };

          setMessages((prev) => {
            const next = [...prev, chatMsg];
            if (next.length > 500) return next.slice(-300);
            return next;
          });
        } catch {
          // malformed message
        }
      }
    });

    return unsubscribe;
  }, [onMessage]);

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

  const clearError = useCallback(() => setWsError(null), []);

  return {
    messages,
    sendMessage,
    isConnected,
    error: wsError,
    clearError,
  };
}
