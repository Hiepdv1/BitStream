"use client";

import { useState, useRef, useCallback, useLayoutEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Users,
  ArrowDown,
  Wifi,
  WifiOff,
  Settings,
  Smile,
  Gift,
} from "lucide-react";
import { useChat, ChatMessage } from "../hooks/useChat";

interface LiveChatProps {
  streamId: string;
  isLive?: boolean;
  mode?: "sidebar" | "mobile" | "overlay";
  viewerCount?: number;
}

export function LiveChat({
  streamId,
  isLive = false,
  mode = "sidebar",
  viewerCount,
}: LiveChatProps) {
  const { messages, sendMessage, isConnected, error, clearError } = useChat({
    streamId,
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000",
    enabled: isLive,
  });

  const [newMessage, setNewMessage] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const checkScrollPosition = useCallback(() => {
    const div = scrollRef.current;
    if (!div) return;
    const isAtBottom = div.scrollHeight - div.scrollTop - div.clientHeight < 50;
    isAtBottomRef.current = isAtBottom;
    setShowScrollToBottom(!isAtBottom);
  }, []);

  const scrollToBottom = (smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
      isAtBottomRef.current = true;
      setShowScrollToBottom(false);
    }
  };

  useLayoutEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage.trim());
    setNewMessage("");
    setTimeout(() => scrollToBottom(true), 10);
  }, [newMessage, sendMessage]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const isOverlay = mode === "overlay";
  const bgClass = isOverlay
    ? "bg-black/50 backdrop-blur-xl"
    : "bg-white dark:bg-[#0e0b1a]";
  const borderClass = isOverlay
    ? "border-white/10"
    : "border-zinc-200 dark:border-white/[0.06]";

  const chatTitle = isLive ? "STREAM CHAT" : "CHAT REPLAY";

  const renderMessage = (msg: ChatMessage) => (
    <div key={msg.id} className="chat-message-row group">
      <div
        className="chat-message-avatar"
        style={{ backgroundColor: msg.color }}
      >
        {msg.userID.charAt(0).toUpperCase()}
      </div>
      <div className="chat-message-content">
        <span className="chat-message-username" style={{ color: msg.color }}>
          {msg.userID}:
        </span>
        <span className="chat-message-text">{msg.message}</span>
      </div>
    </div>
  );

  const renderChatContent = () => (
    <div
      className={`chat-container ${bgClass} ${isOverlay && "chat-overlay-style"} ${borderClass}`}
    >
      {/* Header */}
      <div className={`chat-header ${borderClass}`}>
        <div className="chat-header-left">
          <span className="chat-header-title">{chatTitle}</span>
        </div>

        <div className="chat-header-right">
          {isLive && viewerCount !== undefined && viewerCount > 0 && (
            <div className="chat-viewer-badge" title="Viewers">
              <Users className="w-3 h-3" />
              {viewerCount >= 1000000
                ? `${(viewerCount / 1000000).toFixed(1)}M`
                : viewerCount >= 1000
                  ? `${(viewerCount / 1000).toFixed(1)}K`
                  : viewerCount.toLocaleString()}
            </div>
          )}
          {isLive && (
            <div
              className={`chat-connection-indicator ${isConnected ? "connected" : "disconnected"}`}
            >
              {isConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
            </div>
          )}
          <button className="chat-settings-btn">
            <Settings className="w-4 h-4" />
          </button>
          {mode === "mobile" && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="chat-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="chat-error-banner">
          <span>{error.message}</span>
          <button onClick={clearError} className="chat-error-dismiss">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={checkScrollPosition}
        className={`chat-messages-area ${isOverlay ? "chat-messages-overlay" : ""}`}
      >
        {messages.length === 0 && (
          <div className="chat-empty-state">
            <MessageCircle className="w-6 h-6 text-zinc-400 dark:text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {isLive
                ? isConnected
                  ? "No messages yet. Say something!"
                  : "Connecting to chat..."
                : "Chat replay will appear here"}
            </p>
          </div>
        )}
        {messages.map(renderMessage)}
      </div>

      {/* Scroll to bottom */}
      {showScrollToBottom && (
        <button onClick={() => scrollToBottom()} className="chat-scroll-btn">
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Input */}
      <div className={`chat-input-area ${borderClass}`}>
        <div className="chat-input-wrapper">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isOverlay ? "Chat..." : "Send a message"}
            disabled={!isLive || !isConnected}
            className="chat-input"
          />
          <div className="chat-input-actions">
            <button className="chat-emoji-btn" aria-label="Emoji">
              <Smile className="w-4 h-4" />
            </button>
            <button className="chat-gift-btn" aria-label="Gift">
              <Gift className="w-4 h-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || !isLive || !isConnected}
              className="chat-send-icon-btn"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (mode === "overlay") {
    return (
      <div className="absolute right-4 bottom-24 w-[320px] max-h-[480px] h-[60vh] z-40 pointer-events-auto transition-opacity duration-300 opacity-40 hover:opacity-100 focus-within:opacity-100">
        <div className="w-full h-full animate-in fade-in slide-in-from-right-4 duration-200">
          {renderChatContent()}
        </div>
      </div>
    );
  }

  if (mode === "sidebar") {
    return <div className="w-full h-full">{renderChatContent()}</div>;
  }

  if (mode === "mobile") {
    if (!isMobileOpen) {
      return (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed bottom-4 right-4 z-50 h-10 px-4 bg-brand hover:bg-brand-hover text-white rounded-full shadow-lg flex items-center gap-2 font-semibold text-xs active:scale-95 transition-all shadow-brand/20 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </button>
      );
    }
    return (
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] lg:hidden animate-in fade-in duration-200"
        onClick={() => setIsMobileOpen(false)}
      >
        <div
          className="absolute bottom-0 inset-x-0 h-[65vh] bg-white dark:bg-[#0e0b1a] rounded-t-2xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 ring-1 ring-zinc-200 dark:ring-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {renderChatContent()}
        </div>
      </div>
    );
  }

  return null;
}
