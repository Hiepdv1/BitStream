import { httpRequest } from "@/lib/http/client/http-client";
import { GetStreamQuery, StreamItem } from "../types";

export const getListStream = async (query: GetStreamQuery) => {
  const res = await httpRequest<StreamItem[]>({
    method: "GET",
    url: "/stream/list",
    params: query,
  });

  return res;
};

export const deleteStream = async (streamId: string) => {
  const res = await httpRequest<void>({
    method: "DELETE",
    url: `/stream/${streamId}`,
  });

  return res.data;
};
