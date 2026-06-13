import { QueryOptions } from "@/lib/react-query/type";
import { getStreamKey } from "../api/stream-setup.api";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/hooks";

type streamKeyResponse = Awaited<ReturnType<typeof getStreamKey>>;

type UseGetStreamKeyOptions = {
  streamID: string;
  options?: QueryOptions<streamKeyResponse>;
};

export const useStreamKey = ({ streamID, options }: UseGetStreamKeyOptions) => {
  return useQuery({
    ...options,
    queryKey: [QUERY_KEYS.STREAM_KEY, streamID],
    queryFn: () => getStreamKey(streamID),
  });
};
``;
