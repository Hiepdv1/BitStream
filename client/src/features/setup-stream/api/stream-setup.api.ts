import { httpRequest } from "@/lib/http/client/http-client";
import { ManifestResponse, streamKeyResponse } from "../types/stream-setup";

export const getStreamKey = async (streamID: string) => {
  const res = await httpRequest<streamKeyResponse>({
    url: `/stream/${streamID}/key`,
  });

  return res.data;
};

export const getStreamSession = async (streamID: string) => {
  const res = await httpRequest<ManifestResponse>({
    url: `/stream/${streamID}/session`,
  });

  return res.data;
};
