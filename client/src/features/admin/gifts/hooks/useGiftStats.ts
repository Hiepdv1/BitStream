import { useQuery } from "@tanstack/react-query";
import { QueryOptions } from "@/lib/react-query/type";
import { getGiftStats } from "../api/gift.api";
import { QUERY_KEYS } from "@/hooks";

type GiftStatsOptions = QueryOptions<Awaited<ReturnType<typeof getGiftStats>>>;

export const useGiftStats = (options?: GiftStatsOptions) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GIFT_STATS],
    queryFn: getGiftStats,
    ...options,
  });
};
