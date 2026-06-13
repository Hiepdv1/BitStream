import { PagePaginationQuery } from "@/types/api/query";
import { z } from "zod/v4";

// ── Enums ──
export enum GiftTier {
  BASIC = "BASIC",
  RARE = "RARE",
  EPIC = "EPIC",
  LEGENDARY = "LEGENDARY",
}

export enum ShakeLevel {
  NONE = "NONE",
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

// ── Gift Model ──
export interface Gift {
  id: string;
  name: string;
  price: number;
  image_url: string;
  effect_url: string | null;
  sound_url: string | null;
  duration: number;
  tier: GiftTier;
  shake_level: ShakeLevel;
  is_active: boolean;
  is_chatMode: boolean;
  is_streamMode: boolean;
  createdAt: string;
  updatedAt: string;
}

// -- Gift Active --
export interface GiftActive {
  id: string;
  is_active: boolean;
  updatedAt: string;
}

// ── Filter Types ──
export interface GiftFilterState {
  search: string;
  tier?: GiftTier | "ALL";
  shakeLevel?: ShakeLevel | "ALL";
  status: "ALL" | "ACTIVE" | "INACTIVE";
  sort: "NEWEST" | "OLDEST" | "PRICE_HIGH" | "PRICE_LOW";
}

// ── Stats ──
export interface GiftStats {
  totalGifts: number;
  activeGifts: number;
  inactiveGifts: number;
  totalRevenue: number;
  totalTransactions: number;
}
export interface GetGiftQuery extends PagePaginationQuery {
  search?: string;
  tier?: GiftTier | "ALL";
  shakeLevel?: ShakeLevel | "ALL";
  status?: "ALL" | "ACTIVE" | "INACTIVE";
  sort?: "NEWEST" | "OLDEST" | "PRICE_HIGH" | "PRICE_LOW";
}

export interface ActiveGiftDto {
  id: string;
  is_active: boolean;
}

export interface UpdateGiftSettingsDto {
  giftID: string;
  is_chat_mode: boolean;
  is_stream_mode: boolean;
}
