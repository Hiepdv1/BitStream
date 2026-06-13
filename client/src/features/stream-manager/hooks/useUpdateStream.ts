import { useMutation } from "@tanstack/react-query";
import { httpRequest } from "@/lib/http/client/http-client";
import { MutationOptions } from "@/lib/react-query/type";
import { StreamItem } from "../types";

export interface UpdateStreamParams {
  streamID: string;
  data: FormData;
}

export const updateStream = async ({ streamID, data }: UpdateStreamParams) => {
  const res = await httpRequest<StreamItem>({
    method: "PUT",
    url: `/stream/${streamID}/edit`,
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

type UpdateStreamMutationOptions = MutationOptions<
  Awaited<ReturnType<typeof updateStream>>,
  UpdateStreamParams
>;

export const useUpdateStreamMutation = (
  options?: UpdateStreamMutationOptions,
) => {
  return useMutation({
    mutationFn: updateStream,
    ...options,
  });
};
