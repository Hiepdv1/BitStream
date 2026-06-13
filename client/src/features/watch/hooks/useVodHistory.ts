import { QueryOptions } from "@/lib/react-query/type";
import { getVodHistory } from "../api/watch.api";
import { useQuery } from "@tanstack/react-query";

export type VODChatHistory = QueryOptions<
  Awaited<ReturnType<typeof getVodHistory>>
>;

export const useVodHistory = (
  streamID: string,
  from?: number,
  to?: number,
  limit = 30,
  options?: VODChatHistory,
) => {
  return useQuery({
    ...options,
    queryKey: ["vod-history", options],
    queryFn: () => getVodHistory(streamID, from, to, limit),
    ...(options || {}),
  });
};
