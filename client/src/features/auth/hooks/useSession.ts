import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import * as authApi from "../api/auth.api";
import { ApiError } from "@/lib/http/types/api-error.types";
import { AuthStatus } from "../types/auth";

export const useAuthStatus = (
  options?: Partial<UseQueryOptions<AuthStatus, ApiError, AuthStatus, QueryKey>>
) => {
  return useQuery<AuthStatus, ApiError, AuthStatus, QueryKey>({
    queryKey: ["auth", "status"],
    queryFn: authApi.getAuthStatus,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    ...options,
  });
};
