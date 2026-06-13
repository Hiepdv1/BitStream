import { useQuery } from "@tanstack/react-query";
import { getHistories, GetHistoriesQuery } from "../api/history.api";
import { QueryOptions } from "@/lib/react-query/type";
import { QUERY_KEYS } from "@/hooks";

type UseHistoriesOptions = {
  params: GetHistoriesQuery;
  queryConfig?: QueryOptions<Awaited<ReturnType<typeof getHistories>>>;
};

export const useHistories = ({ params, queryConfig }: UseHistoriesOptions) => {
  return useQuery({
    queryKey: [QUERY_KEYS.HISTORIES, params],
    queryFn: () => getHistories(params),
    ...queryConfig,
  });
};
