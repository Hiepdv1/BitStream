"use client";

import { memo } from "react";
import { useChat } from "../hooks/useChat";
import { useVodChat } from "../hooks/useVodChat";
import ChatPanel from "./ChatPanel";

interface LiveChatProps {
  streamId: string;
  isLive?: boolean;
  mode?: "sidebar" | "mobile" | "overlay";
  currentTimeMs?: number;
}

const LiveChatLive = ({
  streamId,
  mode = "sidebar",
}: Omit<LiveChatProps, "isLive" | "currentTimeMs">) => {
  const {
    messages,
    pinnedMessage,
    sendMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
    isConnected,
    error,
    metrics,
    clearError,
  } = useChat({
    streamId,
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || "",
    enabled: true,
  });

  return (
    <ChatPanel
      mode={mode}
      isLive={true}
      messages={messages}
      pinnedMessage={pinnedMessage}
      onPinMessage={pinMessage}
      onDeleteMessage={deleteMessage}
      onUnpinMessage={unpinMessage}
      isConnected={isConnected}
      viewerCount={metrics.currentViewers}
      error={error}
      onClearError={clearError}
      onSendMessage={sendMessage}
    />
  );
};

const LiveChatVod = ({
  streamId,
  mode = "sidebar",
  currentTimeMs = 0,
}: Omit<LiveChatProps, "isLive">) => {
  const { messages, didSeekBackward } = useVodChat({
    streamId,
    currentTimeMs,
  });

  return (
    <ChatPanel
      mode={mode}
      isLive={false}
      messages={messages}
      pinnedMessage={null}
      didSeekBackward={didSeekBackward}
    />
  );
};

const LiveChat = ({
  streamId,
  isLive = false,
  mode = "sidebar",
  currentTimeMs = 0,
}: LiveChatProps) => {
  if (isLive) {
    return <LiveChatLive streamId={streamId} mode={mode} />;
  }

  return (
    <LiveChatVod
      streamId={streamId}
      mode={mode}
      currentTimeMs={currentTimeMs}
    />
  );
};

export default memo(LiveChat);
