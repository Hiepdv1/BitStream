import axios, { AxiosError } from "axios";
import { ApiError } from "./types/api-error.types";
import { NormalizedResponse } from "./normalize/types";

export function extractApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const res = error.response;
    const data = res?.data as NormalizedResponse;

    return {
      message: data?.message || error.message || "Request failed",
      status: data?.status || error.status || 500,
      fieldErrors: data?.fieldErrors,
      raw: data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
      raw: error,
    };
  }

  return {
    message: "Unknown error",
    status: 500,
    raw: error,
  };
}
