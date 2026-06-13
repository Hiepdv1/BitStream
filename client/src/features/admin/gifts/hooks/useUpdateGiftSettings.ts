import { MutationOptions } from "@/lib/react-query/type";
import { updateGiftSettings } from "../api/gift.api";
import { UpdateGiftSettingsDto } from "../types/gift";
import { useMutation } from "@tanstack/react-query";

type UpdateGiftMutationOptions = MutationOptions<
  Awaited<ReturnType<typeof updateGiftSettings>>,
  UpdateGiftSettingsDto
>;

export const useUpdateGiftSettings = (options?: UpdateGiftMutationOptions) => {
  return useMutation({
    mutationFn: updateGiftSettings,
    ...options,
  });
};
