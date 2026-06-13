import { useMutation } from "@tanstack/react-query";
import { updateGiftActive } from "../api/gift.api";
import type { ActiveGiftDto } from "../types/gift";
import { MutationOptions } from "@/lib/react-query/type";

type GiftActiveOption = MutationOptions<
  Awaited<ReturnType<typeof updateGiftActive>>,
  ActiveGiftDto
>;

export const useGiftActive = (options?: GiftActiveOption) => {
  return useMutation({
    mutationFn: updateGiftActive,
    ...options,
  });
};
