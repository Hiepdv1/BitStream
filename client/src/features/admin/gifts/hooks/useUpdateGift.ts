import { useMutation } from "@tanstack/react-query";
import * as giftApi from "../api/gift.api";
import { MutationOptions } from "@/lib/react-query/type";

type UpdateGiftOption = MutationOptions<
  Awaited<ReturnType<typeof giftApi.updateGift>>,
  giftApi.UpdateGiftParams
>;

export const useUpdateGift = (options?: UpdateGiftOption) => {
  return useMutation({
    mutationFn: giftApi.updateGift,
    ...options,
  });
};
