import { getListStream } from "../api/manager.api";
import { useQuery } from "@tanstack/react-query";
import { QueryOptions } from "@/lib/react-query/type";
import { ApiError } from "@/lib/http/types";
import { GetStreamQuery } from "../types";
import { QUERY_KEYS } from "@/hooks";

type StreamListResponse = Awaited<ReturnType<typeof getListStream>>;

export type UseGetListStreamOptions = {
  params: GetStreamQuery;
  options?: QueryOptions<StreamListResponse, ApiError>;
};

export const useGetListStream = ({
  params,
  options,
}: UseGetListStreamOptions) => {
  return useQuery<StreamListResponse, ApiError>({
    queryKey: [QUERY_KEYS.STREAM_MANAGER_LIST, params],
    queryFn: () => getListStream(params),
    ...options,
  });
};
