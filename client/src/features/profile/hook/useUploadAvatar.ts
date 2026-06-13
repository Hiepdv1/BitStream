import { useMutation } from "@tanstack/react-query";
import { uploadAvatar } from "../API";
import type { MutationOptions } from "@/lib/react-query/type";

type UploadAvatarResponse = Awaited<ReturnType<typeof uploadAvatar>>;

export const useUploadAvatar = (
  opts?: MutationOptions<UploadAvatarResponse, File>,
) => {
  return useMutation({
    ...opts,
    mutationFn: uploadAvatar,
  });
};
