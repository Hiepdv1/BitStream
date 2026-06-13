import { useMutation } from "@tanstack/react-query";
import { deleteGift } from "../api/gift.api";
import { MutationOptions } from "@/lib/react-query/type";

type DeleteGiftOption = MutationOptions<void, string>;

export const useDeleteGift = (options?: DeleteGiftOption) => {
  return useMutation({
    mutationFn: deleteGift,
    ...options,
  });
};
