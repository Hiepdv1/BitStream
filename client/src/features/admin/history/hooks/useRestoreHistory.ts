import { useMutation } from "@tanstack/react-query";
import { restoreHistory } from "../api/history.api";
import { MutationOptions } from "@/lib/react-query/type";

type UseRecoverHistoryOptions = MutationOptions<
  Awaited<ReturnType<typeof restoreHistory>>,
  { id: string; reason?: string }
>;

export const useRestoreHistory = (options?: UseRecoverHistoryOptions) => {
  return useMutation({
    mutationFn: restoreHistory,
    ...options,
  });
};
