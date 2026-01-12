import { useMutation } from "@tanstack/react-query";
import * as authApi from "../api/auth.api";
import { ApiError } from "@/lib/http/types/api-error.types";
import { AuthTokenPayload } from "../types/auth";

export const useEmailVerification = () => {
  return useMutation<AuthTokenPayload, ApiError, string>({
    mutationFn: authApi.verifyEmail,
  });
};
