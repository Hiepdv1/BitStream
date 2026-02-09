import { api as axiosClient } from "@/lib/http/client/axios-client";
import { httpRequest } from "@/lib/http/client/http-client";

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
};
