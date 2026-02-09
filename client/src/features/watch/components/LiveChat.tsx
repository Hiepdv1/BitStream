"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import {
  MessageCircle,
  X,
  Send,
  Users,
  MoreVertical,
  ArrowDown,
} from "lucide-react";

// --- Types ---

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  color?: string;
  isModerator?: boolean;
}

interface LiveChatProps {
  streamId: string;
  isLive?: boolean;
  mode?: "sidebar" | "mobile" | "overlay";
}

// --- Mock Data ---

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    username: "TechFan",
    message: "Great stream! 🔥",
    timestamp: new Date(),
    color: "#a78bfa",
  },
  {
    id: "2",
    username: "CodeMaster",
    message: "What library are you using for the player?",
    timestamp: new Date(),
    color: "#f472b6",
  },
  {
    id: "3",
    username: "StreamViewer",
    message: "Love the new UI update! Much cleaner.",
    timestamp: new Date(),
    color: "#4ade80",
  },
  {
    id: "4",
    username: "DevNinja",
    message: "Can you explain the HLS setup again?",
    timestamp: new Date(),
    color: "#60a5fa",
  },
  {
    id: "5",
    username: "WebWizard",
    message: "Following! 👍",
    timestamp: new Date(),
    color: "#fbbf24",
  },
];

export function LiveChat({
  streamId,
  isLive = true,
  mode = "sidebar",
}: LiveChatProps) {
  // --- State ---
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [viewerCount] = useState(1234);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // --- Refs ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true); // Track if user is at bottom

  // --- Helpers ---

  /** Check if user is scrolled to bottom */
  const checkScrollPosition = useCallback(() => {
    const div = scrollRef.current;
    if (!div) return;

    // Tolerance of 20px
    const isAtBottom = div.scrollHeight - div.scrollTop - div.clientHeight < 50;
    isAtBottomRef.current = isAtBottom;
    setShowScrollToBottom(!isAtBottom);
  }, []);

  /** Scroll to bottom smoothly */
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

  // --- Effects ---

  /** Handle new messages: Auto-scroll ONLY if already at bottom */
  useLayoutEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  // --- Handlers ---

  /** Send message handler */
  const handleSend = useCallback(() => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      username: "You",
      message: newMessage.trim(),
      timestamp: new Date(),
      color: "#a78bfa",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Always scroll to bottom when *sending* a message
    setTimeout(() => scrollToBottom(true), 10);
  }, [newMessage]);

  /** Key press handler (Enter to send) */
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // --- CSS for Custom Scrollbar ---
  // Injected style for webkit scrollbar
  const scrollbarStyles = `
    .chat-scroll::-webkit-scrollbar {
        width: 6px;
    }
    .chat-scroll::-webkit-scrollbar-track {
        background: transparent;
    }
    .chat-scroll::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
    }
    .chat-scroll::-webkit-scrollbar-thumb:hover {
        background-color: rgba(255, 255, 255, 0.4);
    }
  `;

  // --- Render Functions ---

  const isOverlay = mode === "overlay";
  const bgClass = isOverlay ? "bg-black/40 backdrop-blur-md" : "bg-background";
  const borderClass = isOverlay ? "border-white/10" : "border-white/5";

  const renderChatContent = () => (
    <div
      className={`flex flex-col h-full w-full ${bgClass} ${isOverlay ? "rounded-lg border " + borderClass : "border-l " + borderClass}`}
    >
      <style>{scrollbarStyles}</style>

      {/* Header Area */}
      {!isOverlay && (
        <div
          className={`flex items-center justify-between px-4 py-3 border-b ${borderClass} z-10 shadow-sm shrink-0`}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-text-main tracking-tight uppercase">
              Stream Chat
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isLive && (
              <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded text-xs font-medium text-red-500">
                <Users className="w-3 h-3" />
                <span>{viewerCount.toLocaleString()}</span>
              </div>
            )}
            {mode === "mobile" && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages List */}
      <div
        ref={scrollRef}
        onScroll={checkScrollPosition}
        className={`chat-scroll flex-1 overflow-y-auto px-3 py-2 space-y-2 ${isOverlay ? "scrollbar-none hover:scrollbar-thin" : ""}`}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="text-[12px] leading-snug group animate-in slide-in-from-bottom-1 duration-200"
          >
            <span
              className="font-bold cursor-pointer mr-1.5 opacity-90 hover:opacity-100 transition-opacity drop-shadow-sm"
              style={{ color: msg.color }}
            >
              {msg.username}:
            </span>
            <span className="text-white/80 wrap-break-word drop-shadow-md">
              {msg.message}
            </span>
          </div>
        ))}
      </div>

      {/* Scroll to Bottom Button (Overlay) */}
      {showScrollToBottom && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/80 text-white rounded-full p-1.5 shadow-lg border border-white/10 animate-in fade-in zoom-in duration-200 z-20 cursor-pointer"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Input Area */}
      <div className={`p-3 border-t ${borderClass} z-10 shrink-0`}>
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isOverlay ? "Chat..." : "Send a message..."}
            className={`w-full pl-3 pr-9 py-2 bg-zinc-900/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand/50 focus:bg-zinc-900 transition-all ${isOverlay ? "text-xs" : ""}`}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-brand disabled:text-zinc-700 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  // --- Conditional Rendering Modes ---

  // Mode: Overlay (Fullscreen)
  if (mode === "overlay") {
    return (
      <div className="absolute right-4 bottom-20 top-20 w-[300px] z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
        {renderChatContent()}
      </div>
    );
  }

  // Mode: Sidebar (Desktop)
  if (mode === "sidebar") {
    return <div className="w-full h-full">{renderChatContent()}</div>;
  }

  // Mode: Mobile (Bottom Sheet)
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
          className="absolute bottom-0 inset-x-0 h-[65vh] bg-background rounded-t-2xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 ring-1 ring-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {renderChatContent()}
        </div>
      </div>
    );
  }

  return null;
}
