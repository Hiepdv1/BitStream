import { useMutation } from "@tanstack/react-query";
import { deleteHistory } from "../api/history.api";
import { MutationOptions } from "@/lib/react-query/type";

type UseDeleteHistoryOptions = MutationOptions<
  Awaited<ReturnType<typeof deleteHistory>>,
  { id: string; reason?: string }
>;

export const useDeleteHistory = (options?: UseDeleteHistoryOptions) => {
  return useMutation({
    mutationFn: deleteHistory,
    ...options,
  });
};
