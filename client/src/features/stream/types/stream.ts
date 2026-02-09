export type StreamVisibility = "PUBLIC" | "PRIVATE" | "UNLISTED";

export interface StreamData {
  streamId: string;
  title: string;
  description: string | null;
  isLive: boolean;
  totalDuration: number;
  segmentCount: number;
  createdAt: string;
  updatedAt: string;
}
