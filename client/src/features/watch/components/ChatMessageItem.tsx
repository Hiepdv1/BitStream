import { memo } from "react";
import { Pin, Trash2, MessageSquare } from "lucide-react";
import { ChatMessage } from "../types";

interface ChatMessageItemProps {
  message: ChatMessage;
  isLive: boolean;
  onPin?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

const ChatMessageItem = ({
  message: msg,
  isLive,
  onPin,
  onDelete,
}: ChatMessageItemProps) => {
  const bgImage = msg.userAvatar
    ? `url(${process.env.NEXT_PUBLIC_ASSET_URL0}/atavar/${msg.userAvatar})`
    : "url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5_da0qTAwrDC4_hdwS2siGr6ULu-_-TN6fQ&s)";

  if (msg.isDeleted) {
    return (
      <div className="chat-message-row chat-message-deleted">
        <div
          className="chat-message-avatar"
          style={{ backgroundImage: bgImage }}
        />
        <div className="chat-message-content">
          <span
            className="chat-message-username text-black dark:text-white"
            style={{ color: msg.userAvatar }}
          >
            {msg.userName}:
          </span>
          <span className="chat-message-text chat-message-text--deleted">
            message deleted
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-message-row group">
      <div
        className="chat-message-avatar"
        style={{ backgroundImage: bgImage }}
      />
      <div className="chat-message-content">
        <span
          className="chat-message-username text-black dark:text-white"
          style={{ color: msg.userAvatar }}
        >
          {msg.userName}:
        </span>
        <span className="chat-message-text font-medium">{msg.message}</span>
      </div>

      {/* Hover Action Bar */}

      {isLive && (
        <div className="chat-message-actions">
          {onPin && (
            <button
              className="chat-action-btn"
              onClick={() => onPin(msg.id)}
              title="Pin message"
              aria-label="Pin message"
            >
              <Pin className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              className="chat-action-btn chat-action-btn--danger"
              onClick={() => onDelete(msg.id)}
              title="Delete message"
              aria-label="Delete message"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          {/* TODO: Reply functionality placeholder */}
          <button
            className="chat-action-btn"
            title="Reply"
            aria-label="Reply to message"
          >
            <MessageSquare className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(ChatMessageItem);
