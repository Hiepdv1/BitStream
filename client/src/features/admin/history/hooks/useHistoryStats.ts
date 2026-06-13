import { useQuery } from "@tanstack/react-query";
import { getHistoryStats } from "../api/history.api";
import { QueryOptions } from "@/lib/react-query/type";
import { QUERY_KEYS } from "@/hooks";

type UseHistoryStatsOptions = QueryOptions<
  Awaited<ReturnType<typeof getHistoryStats>>
>;

export const useHistoryStats = (queryConfig?: UseHistoryStatsOptions) => {
  return useQuery({
    queryKey: [QUERY_KEYS.HISTORY_STATS],
    queryFn: getHistoryStats,
    ...queryConfig,
  });
};
