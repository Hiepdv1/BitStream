import { getGifts } from "../api/gift.api";
import { useQuery } from "@tanstack/react-query";
import { QueryOptions } from "@/lib/react-query/type";
import { ApiError } from "@/lib/http/types";
import { GetGiftQuery } from "../types/gift";
import { QUERY_KEYS } from "@/hooks";

type GiftResponse = Awaited<ReturnType<typeof getGifts>>;

export type UseGiftsOptions = {
  params: GetGiftQuery;
  options?: QueryOptions<GiftResponse, ApiError>;
};

export const useGifts = ({ params, options }: UseGiftsOptions) => {
  return useQuery<GiftResponse, ApiError>({
    queryKey: [QUERY_KEYS.GIFTS, params],
    queryFn: () => getGifts(params),
    ...options,
  });
};
