import { MutationOptions } from "@/lib/react-query/type";
import { changePassword } from "../API";
import { useMutation } from "@tanstack/react-query";

type changePasswordResponse = Awaited<ReturnType<typeof changePassword>>;

export const useChangePassword = (
  opts?: MutationOptions<changePasswordResponse, Record<string, string>>,
) => {
  return useMutation({
    ...opts,
    mutationFn: changePassword,
  });
};
