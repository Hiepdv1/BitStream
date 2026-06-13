import { useQuery } from "@tanstack/react-query";
import { getGiftDetail } from "../api/gift.api";
import { QueryOptions } from "@/lib/react-query/type";
import { QUERY_KEYS } from "@/hooks";

type GetDetailGiftOption = QueryOptions<
  Awaited<ReturnType<typeof getGiftDetail>>
>;

export const useDetailGift = (id: string, options?: GetDetailGiftOption) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GIFT_DETAIL, id],
    queryFn: () => getGiftDetail(id),
    ...options,
  });
};
