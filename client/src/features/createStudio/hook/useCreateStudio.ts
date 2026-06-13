import { MutationOptions } from "@/lib/react-query/type";
import { createStudio } from "../api";
import { useMutation } from "@tanstack/react-query";

type CreateStudioResponse = Awaited<ReturnType<typeof createStudio>>;

export const useCreateStudio = (
  opts?: MutationOptions<CreateStudioResponse, null>,
) => {
  return useMutation({
    ...opts,
    mutationFn: createStudio,
  });
};
