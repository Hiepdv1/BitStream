import { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { ApiError } from "@/lib/http/types/api-error.types";

export type QueryOptions<
  TQueryFnData = unknown,
  TError = ApiError,
  TData = TQueryFnData,
> = Omit<UseQueryOptions<TQueryFnData, TError, TData>, "queryKey" | "queryFn">;

export type MutationOptions<
  TData,
  TVariables,
  TError = ApiError,
  TContext = unknown,
> = UseMutationOptions<TData, TError, TVariables, TContext>;
