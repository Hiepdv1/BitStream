import { httpRequest } from "@/lib/http/client/http-client";
import {
  LiveHistoryResponse,
  SessionStream,
  VodHistoryResponse,
} from "../types";
import { buildQuery } from "@/helpers";
import { StreamData } from "@/features/create-stream/types/stream";

export const getLiveHistory = async (streamID: string) => {
  const response = await httpRequest<LiveHistoryResponse>({
    url: `/chat/live/history/${streamID}`,
  });

  return response.data;
};

export const getVodHistory = async (
  streamID: string,
  from?: number,
  to?: number,
  limit: number = 30,
) => {
  const query = buildQuery({
    s: streamID,
    from,
    to,
    limit,
  });

  const response = await httpRequest<VodHistoryResponse[]>({
    url: `/chat/vod/history${query}`,
  });

  return response;
};

export const getStreamData = async (streamID: string) => {
  const response = await httpRequest<StreamData>({
    url: `/stream/${streamID}`,
  });

  return response.data;
};
