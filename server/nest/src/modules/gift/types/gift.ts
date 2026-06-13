import { GiftTier, ShakeLevel } from 'src/generated/prisma/enums';

export interface GiftDisplaySettings {
  is_chat_mode: boolean;
  is_stream_mode: boolean;
  giftID: string;
}

export interface UpdateGift {
  giftID: string;
  name?: string;
  price?: number;
  duration?: number;
  tier?: GiftTier;
  shake_level?: ShakeLevel;
  is_active?: boolean;
  is_chatMode?: boolean;
  is_streamMode?: boolean;
  image?: Express.Multer.File;
  effect?: Express.Multer.File;
  sound?: Express.Multer.File;
}
