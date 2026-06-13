import { getLiveHistory } from "@/features/watch/api/watch.api";
import { QueryOptions } from "@/lib/react-query/type";
import { useQuery } from "@tanstack/react-query";

export type LiveHistoryResponse = QueryOptions<
  Awaited<ReturnType<typeof getLiveHistory>>
>;

export const useLiveHistory = (
  streamID: string,
  options?: LiveHistoryResponse,
) => {
  return useQuery({
    queryKey: ["live-history", streamID],
    queryFn: () => getLiveHistory(streamID),
    ...options,
  });
};
