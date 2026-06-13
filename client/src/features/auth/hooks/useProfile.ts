import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getProfile } from "../api/auth.api";
import type { QueryOptions } from "@/lib/react-query/type";
import { QUERY_KEYS, QUERY_OPTIONS } from "@/hooks";
import { cache } from "react";

type ProfileResponse = Awaited<ReturnType<typeof getProfile>>;

export const useProfile = (options?: QueryOptions<ProfileResponse>) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE],
    queryFn: cache(getProfile),
    ...(QUERY_OPTIONS.USER_PROFILE as QueryOptions<ProfileResponse>),
    ...options,
  });
};

export const useSuspenseProfile = (options?: QueryOptions<ProfileResponse>) => {
  return useSuspenseQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE],
    queryFn: cache(getProfile),
    ...(QUERY_OPTIONS.USER_PROFILE as QueryOptions<ProfileResponse>),
    ...options,
  });
};
