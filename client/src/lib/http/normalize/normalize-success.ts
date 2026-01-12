import { NormalizedResponse } from "./types";

export function normalizeSuccess<T>(
  res: any,
  status: number
): NormalizedResponse<T> {
  return {
    success: true,
    message: res?.message || "Success",
    data: res?.data,
    meta: res?.meta,
    status,
  };
}
