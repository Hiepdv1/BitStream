import { useMutation } from "@tanstack/react-query";
import { rollbackHistory } from "../api/history.api";
import { MutationOptions } from "@/lib/react-query/type";

type UseRollbackHistoryOptions = MutationOptions<
  Awaited<ReturnType<typeof rollbackHistory>>,
  { id: string; reason?: string }
>;

export const useRollbackHistory = (options?: UseRollbackHistoryOptions) => {
  return useMutation({
    mutationFn: rollbackHistory,
    ...options,
  });
};
