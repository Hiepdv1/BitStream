import {
  useMutation,
  UseMutationOptions,
  QueryKey,
} from "@tanstack/react-query";
import * as authApi from "../api/auth.api";
import { ApiError } from "@/lib/http/types/api-error.types";

export type ResendMailMutationOptional = UseMutationOptions<
  Awaited<ReturnType<typeof authApi.resendVerificationEmail>>,
  ApiError,
  null
>;

export const useResendMail = (options?: ResendMailMutationOptional) => {
  return useMutation({
    mutationFn: authApi.resendVerificationEmail,
    ...options,
  });
};
