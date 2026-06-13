import { useMutation } from "@tanstack/react-query";
import { deleteStream } from "../api/manager.api";
import { MutationOptions } from "@/lib/react-query/type";

type DeleteStreamResponse = Awaited<ReturnType<typeof deleteStream>>;

export const useDeleteStream = (
  opts?: MutationOptions<DeleteStreamResponse, string>,
) => {
  return useMutation({
    ...opts,
    mutationFn: deleteStream,
  });
};
