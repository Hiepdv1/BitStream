import { useQuery } from "@tanstack/react-query";
import { getProfileExtensions } from "../API";
import type { QueryOptions } from "@/lib/react-query/type";
import { QUERY_KEYS } from "@/hooks";

type ProfileExtensionsResponse = Awaited<
  ReturnType<typeof getProfileExtensions>
>;

export default function useProfileExtensions(
  options?: QueryOptions<ProfileExtensionsResponse>,
) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_EXTENSIONS],
    queryFn: getProfileExtensions,
    ...options,
  });
}
