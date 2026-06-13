import { useMutation } from "@tanstack/react-query";
import { streamApi } from "../api/stream.api";
import { MutationOptions } from "@/lib/react-query/type";

type CreateStreamMutationOptions = MutationOptions<
  Awaited<ReturnType<typeof streamApi.createStream>>,
  FormData
>;

export const useCreateStreamMutation = (
  options?: CreateStreamMutationOptions,
) => {
  return useMutation({
    mutationFn: streamApi.createStream,
    ...options,
  });
};
