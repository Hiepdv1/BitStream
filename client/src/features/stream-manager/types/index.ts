import { PagePaginationQuery } from "@/types/api/query";

export type StreamStatus = "ALL" | "LIVE" | "DRAFT" | "ENDED";

export interface GetStreamQuery extends PagePaginationQuery {
  status?: StreamStatus;
  search?: string;
}

export interface StreamItem {
  id: string;
  thumbnail_url: string | null;
  userId: string;
  title: string;
  description: string | null;
  isLive: boolean;
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
  meta: {
    totalDuration: number;
  } | null;
}

