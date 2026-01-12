import { ZodError } from "zod";
import { NormalizedResponse } from "./types";

export function normalizeError(
  error: any,
  status: number = 400
): NormalizedResponse {
  if (error instanceof ZodError) {
    return {
      success: false,
      message: "Invalid input",
      fieldErrors: error.flatten().fieldErrors,
      status: 422,
    };
  }

  if (Array.isArray(error?.errors)) {
    const fieldErrors: Record<string, string[]> = {};

    for (const e of error.errors) {
      fieldErrors[e.field] = e.errors;
    }

    return {
      success: false,
      message: error.message || "Validation failed",
      fieldErrors,
      status,
    };
  }

  return {
    success: false,
    message: error?.message || "Request failed",
    status,
  };
}
