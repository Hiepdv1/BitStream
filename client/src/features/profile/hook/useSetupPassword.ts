import { MutationOptions } from "@/lib/react-query/type";
import { setupPassword } from "../API";
import { useMutation } from "@tanstack/react-query";

type SetupPasswordResponse = Awaited<ReturnType<typeof setupPassword>>;

export const useSetupPassword = (
  opts?: MutationOptions<SetupPasswordResponse, string>,
) => {
  return useMutation({
    ...opts,
    mutationFn: setupPassword,
  });
};
