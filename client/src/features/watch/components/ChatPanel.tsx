"use client";

import { useState, useRef, useCallback, useLayoutEffect, memo } from "react";
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
  Pin,
} from "lucide-react";
import { ChatMessage } from "../types";
import { Button } from "@/components/ui/Button";
import ChatMessageItem from "./ChatMessageItem";
import GiftPanel from "./GiftPanel";

// ─── Shared contract between Live & VOD modes ───────────────────────
export interface ChatPanelProps {
  mode: "sidebar" | "mobile" | "overlay";
  isLive: boolean;

  messages: ChatMessage[];
  pinnedMessage: ChatMessage | null;
  onPinMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onUnpinMessage?: (messageId: string) => void;

  // Live-only
  isConnected?: boolean;
  viewerCount?: number;
  error?: { message: string } | null;
  onClearError?: () => void;
  onSendMessage?: (text: string) => void;

  // VOD-only (seek-backward snap scroll)
  didSeekBackward?: boolean;
}

// ─── ChatPanel: Pure UI component ───────────────────────────────────
const ChatPanel = ({
  mode,
  isLive,
  messages,
  pinnedMessage,
  onPinMessage,
  onDeleteMessage,
  onUnpinMessage,
  isConnected = false,
  viewerCount = 0,
  error,
  onClearError,
  onSendMessage,
  didSeekBackward = false,
}: ChatPanelProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
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
    if (isLive) {
      if (isAtBottomRef.current) scrollToBottom();
    } else {
      if (isAtBottomRef.current || didSeekBackward) scrollToBottom(false);
    }
  }, [messages, isLive, didSeekBackward]);

  const handleSend = useCallback(() => {
    const trimmed = newMessage.trim();
    if (!trimmed || !onSendMessage) return;
    onSendMessage(trimmed);
    setNewMessage("");
  }, [newMessage, onSendMessage]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.currentTarget.value);
  };

  const onGiveGift = (giftId: string) => {
    console.log("Send gift:", giftId);
    // setShowGiftPanel(false);
  };

  const isOverlay = mode === "overlay";
  const bgClass = isOverlay
    ? "bg-black/50 backdrop-blur-xl"
    : "bg-white dark:bg-background";
  const borderClass = isOverlay
    ? "border-white/10"
    : "border-zinc-200 dark:border-border";
  const chatTitle = isLive ? "STREAM CHAT" : "CHAT REPLAY";

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
          {isLive && (
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

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className="chat-pinned-banner">
          <div className="chat-pinned-banner-icon">
            <Pin className="w-3 h-3" />
          </div>
          <div className="chat-pinned-banner-content">
            <span className="chat-pinned-banner-user">
              {pinnedMessage.userName}:
            </span>
            <span className="chat-pinned-banner-text">
              {pinnedMessage.message}
            </span>
          </div>
          <button
            className="chat-pinned-banner-close"
            onClick={() => onUnpinMessage?.(pinnedMessage.id)}
            aria-label="Unpin message"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Error Banner (Live only) */}
      {isLive && error && (
        <div className="chat-error-banner">
          <span>{error.message}</span>
          <button onClick={onClearError} className="chat-error-dismiss">
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
        {messages.map((msg) => (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            isLive={isLive}
            onPin={onPinMessage}
            onDelete={onDeleteMessage}
          />
        ))}
      </div>

      {/* Scroll to bottom */}
      {showScrollToBottom && (
        <button onClick={() => scrollToBottom()} className="chat-scroll-btn">
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      )}

      {showGiftPanel && isLive && (
        <GiftPanel
          onClose={() => setShowGiftPanel(false)}
          onSelectGift={setSelectedGiftId}
          selectedGiftId={selectedGiftId}
          onSend={onGiveGift}
        />
      )}

      {/* Input */}
      <div className={`chat-input-area ${borderClass}`}>
        <div className="chat-input-wrapper">
          <input
            type="text"
            value={newMessage}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder={
              !isLive
                ? "Chat is replay only"
                : isOverlay
                  ? "Chat..."
                  : "Send a message"
            }
            disabled={!isLive || !isConnected}
            className="chat-input"
          />
          <div className="chat-input-actions">
            <button className="chat-emoji-btn" aria-label="Emoji">
              <Smile className="w-4 h-4" />
            </button>
            <button
              className="chat-gift-btn"
              aria-label="Gift"
              onClick={() => setShowGiftPanel((prev) => !prev)}
            >
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
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsMobileOpen(true)}
          className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg shadow-brand/20"
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </Button>
      );
    }
    return (
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] lg:hidden animate-in fade-in duration-200"
        onClick={() => setIsMobileOpen(false)}
      >
        <div
          className="absolute bottom-0 inset-x-0 h-[65vh] bg-white dark:bg-background rounded-t-2xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 ring-1 ring-zinc-200 dark:ring-border"
          onClick={(e) => e.stopPropagation()}
        >
          {renderChatContent()}
        </div>
      </div>
    );
  }

  return null;
};

export default memo(ChatPanel);
