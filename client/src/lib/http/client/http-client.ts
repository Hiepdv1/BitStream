import type { AxiosRequestConfig } from "axios";
import { api } from "./axios-client";
import { NormalizedResponseSuccess } from "./normalized-response";

export async function httpRequest<TResponse = unknown>(
  config: AxiosRequestConfig
): Promise<NormalizedResponseSuccess<TResponse>> {
  const res = await api.request(config);
  return res.data;
}
