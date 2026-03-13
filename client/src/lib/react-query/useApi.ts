import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { httpRequest } from "../http/client/http-client";

export function useApiQuery<TData = any>(
  queryKey: string[],
  url: string,
  params?: Record<string, any>,
  options?: Omit<
    UseQueryOptions<TData, Error, TData, string[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const data = await httpRequest<TData>({
        url,
        method: "GET",
        params,
      });
      return data as TData;
    },
    ...options,
  });
}

export function useApiMutation<TVariables = any, TData = any>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">,
) {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const data = await httpRequest<TData>({
        url,
        method,
        data: variables,
      });
      return data as TData;
    },
    ...options,
  });
}
