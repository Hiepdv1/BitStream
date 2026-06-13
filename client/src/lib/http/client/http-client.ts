import { AxiosError, type AxiosRequestConfig } from "axios";
import { api } from "./axios-client";
import { NormalizedResponseSuccess } from "./normalized-response";

export async function httpRequest<TResponse = unknown>(
  config: AxiosRequestConfig,
): Promise<NormalizedResponseSuccess<TResponse>> {
  try {
    const res = await api.request(config);
    return res.data;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      const serverMessage = error?.response?.data?.message;
      throw new Error(serverMessage);
    }
    throw new Error(error?.message || "Request failed");
  }
}
