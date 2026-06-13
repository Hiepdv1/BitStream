import { api as axiosClient } from "@/lib/http/client/axios-client";
import { httpRequest } from "@/lib/http/client/http-client";
import { CreateStreamResponse } from "../types/stream";

export interface StreamInfo {
  id: string;
  title: string;
  isLive: boolean;
  totalDuration: number;
}

export const streamApi = {
  getStreamInfo: async (streamId: string): Promise<StreamInfo> => {
    const response = await httpRequest<StreamInfo>({
      url: `/stream/${streamId}/info`,
      method: "GET",
    });

    return response.data;
  },

  createStream: async (formData: FormData) => {
    const response = await httpRequest<CreateStreamResponse>({
      url: "/stream",
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
