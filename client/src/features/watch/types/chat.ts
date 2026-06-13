import { PaginationMeta } from "@/lib/http/normalize/types";

export interface ChatMessage {
  id: string;
  userID: string;
  userName: string;
  userAvatar: string;
  message: string;
  offsetMs: number;
  timestamp?: Date;
  isDeleted?: boolean;
  isPinned?: boolean;
}

export interface LiveHistoryResponse {
  messages: ChatMessage[];
  pinned: ChatMessage | null;
}

export interface StreamMetrics {
  currentViewers: number;
  totalViews: number;
}

export interface VodHistoryResponse {
  id: string;
  content: string;
  userId: string;
  offsetMs: number;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface SessionStream {
  manifestUrl: string;
  expiresMs: number;
}
