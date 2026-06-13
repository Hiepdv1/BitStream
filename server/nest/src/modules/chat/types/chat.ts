import { ChatMesssageType } from 'src/generated/prisma/enums';

export interface StreamSession {
  startedAt: number;
  ownerId?: string;
  status: 'live' | 'ended';
}

export interface CacheLiveMessage {
  id: string;
  userID: string;
  userName: string;
  userAvatar: string;
  message: string;
  offsetMs: number;
  isDeleted?: boolean;
  isPinned?: boolean;
}
