import { useMutation } from "@tanstack/react-query";
import * as giftApi from "../api/gift.api";
import { MutationOptions } from "@/lib/react-query/type";

type CreateGiftMutationOptions = MutationOptions<
  Awaited<ReturnType<typeof giftApi.createGift>>,
  giftApi.CreateGiftParams
>;

export const useCreateGift = (options?: CreateGiftMutationOptions) => {
  return useMutation({
    mutationFn: giftApi.createGift,
    ...options,
  });
};
