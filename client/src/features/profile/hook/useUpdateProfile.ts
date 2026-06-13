import { MutationOptions } from "@/lib/react-query/type";
import { updateProfile } from "../API";
import { useMutation } from "@tanstack/react-query";

type updateProfileResponse = Awaited<ReturnType<typeof updateProfile>>;

export const useUpdateProfile = (
  opts?: MutationOptions<updateProfileResponse, { name?: string; bio?: string }>,
) => {
  return useMutation({
    ...opts,
    mutationFn: updateProfile,
  });
};
