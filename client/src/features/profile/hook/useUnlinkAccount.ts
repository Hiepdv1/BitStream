import { MutationOptions } from "@/lib/react-query/type";
import { unlinkSocialAccount } from "../API";
import { useMutation } from "@tanstack/react-query";

type unlinkAccountResponse = Awaited<ReturnType<typeof unlinkSocialAccount>>;

export const useUnlinkAccount = (
  opts?: MutationOptions<unlinkAccountResponse, string>,
) => {
  return useMutation({
    ...opts,
    mutationFn: unlinkSocialAccount,
  });
};
