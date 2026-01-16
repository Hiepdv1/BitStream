"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  Send,
  Smile,
  GripVertical,
  Users,
} from "lucide-react";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  color?: string;
}

interface LiveChatProps {
  streamId: string;
  isLive?: boolean;
}

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    username: "TechFan",
    message: "Great stream! 🔥",
    timestamp: new Date(),
    color: "#7c3aed",
  },
  {
    id: "2",
    username: "CodeMaster",
    message: "What library is that?",
    timestamp: new Date(),
    color: "#db2777",
  },
  {
    id: "3",
    username: "StreamViewer",
    message: "Love the content!",
    timestamp: new Date(),
    color: "#22c55e",
  },
  {
    id: "4",
    username: "DevNinja",
    message: "Can you explain that again?",
    timestamp: new Date(),
    color: "#3b82f6",
  },
  {
    id: "5",
    username: "WebWizard",
    message: "Following! 👍",
    timestamp: new Date(),
    color: "#f59e0b",
  },
];

export function LiveChat({ streamId, isLive = true }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDetached, setIsDetached] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [viewerCount] = useState(1234);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDetached) return;

      setIsDragging(true);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      dragStartPos.current = {
        x: clientX - position.x,
        y: clientY - position.y,
      };
    },
    [isDetached, position]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      setPosition({
        x: clientX - dragStartPos.current.x,
        y: clientY - dragStartPos.current.y,
      });
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging]);

  const handleSend = useCallback(() => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      username: "You",
      message: newMessage.trim(),
      timestamp: new Date(),
      color: "#7c3aed",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  }, [newMessage]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const toggleDetached = useCallback(() => {
    if (isDetached) {
      setPosition({ x: 0, y: 0 });
    }
    setIsDetached(!isDetached);
  }, [isDetached]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-14 h-14 bg-brand hover:bg-brand-hover text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        title="Open Chat"
      >
        <MessageCircle className="w-6 h-6" />
        {isLive && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>
    );
  }

  const chatContent = (
    <div
      ref={dragRef}
      className={`flex flex-col bg-surface/95 backdrop-blur-lg border border-border rounded-2xl shadow-2xl overflow-hidden transition-all ${
        isMinimized ? "h-14" : "h-[450px]"
      } ${isDetached ? "w-[360px]" : "w-full"}`}
      style={
        isDetached
          ? {
              position: "fixed",
              left: position.x || "auto",
              top: position.y || "auto",
              right: position.x ? "auto" : "16px",
              bottom: position.y ? "auto" : "16px",
              zIndex: 50,
            }
          : {}
      }
    >
      <div
        className={`flex items-center justify-between px-4 py-3 bg-surface border-b border-border ${
          isDetached ? "cursor-move" : ""
        }`}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className="flex items-center gap-3">
          {isDetached && <GripVertical className="w-4 h-4 text-text-muted" />}
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-brand" />
            <span className="font-semibold text-text-main">Live Chat</span>
          </div>
          {isLive && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-red-500">LIVE</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <div className="hidden sm:flex items-center gap-1 text-text-muted text-sm mr-2">
            <Users className="w-4 h-4" />
            <span>{viewerCount.toLocaleString()}</span>
          </div>

          <button
            onClick={toggleDetached}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-text-muted transition-colors"
            title={isDetached ? "Dock chat" : "Detach chat"}
          >
            {isDetached ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-text-muted transition-colors"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors"
            title="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="flex gap-2 text-sm animate-in slide-in-from-bottom-2 duration-200"
              >
                <span
                  className="font-semibold shrink-0"
                  style={{ color: msg.color }}
                >
                  {msg.username}:
                </span>
                <span className="text-text-main wrap-break-word">
                  {msg.message}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-text-muted transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Send a message..."
                className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (isDetached) {
    return chatContent;
  }

  return <div className="w-full">{chatContent}</div>;
}
