"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  BinaryWriter,
  BinaryReader,
  Opcode,
  PACKET_VERSION,
} from "../lib/protocol";

export interface WsError {
  status: number;
  message: string;
  errors?: unknown;
}

type BinaryMessageHandler = (opcode: number, reader: BinaryReader) => void;

interface UseSocketOptions {
  url: string;
  enabled?: boolean;
}

export function useSocket({ url, enabled = false }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<Set<BinaryMessageHandler>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<WsError | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const socket = io(url, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("exception", (data: WsError) => {
      setError(data);
    });

    socket.on("b", (data: ArrayBuffer) => {
      try {
        let buf: ArrayBuffer;
        if (data instanceof ArrayBuffer) {
          buf = data;
        } else {
          const u8 = data as unknown as Uint8Array;
          buf = u8.buffer.slice(
            u8.byteOffset,
            u8.byteOffset + u8.byteLength,
          ) as ArrayBuffer;
        }

        const reader = new BinaryReader(buf);
        const version = reader.readUint8();
        const opcode = reader.readUint8();

        if (version !== PACKET_VERSION) return;

        handlersRef.current.forEach((handler) => {
          handler(opcode, reader);
        });
      } catch {}
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [url, enabled]);

  const sendPacket = useCallback((writer: BinaryWriter) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    socket.emit("b", writer.finish());
  }, []);

  const onMessage = useCallback((handler: BinaryMessageHandler) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  return { sendPacket, onMessage, isConnected, error };
}
