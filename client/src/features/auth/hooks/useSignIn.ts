import { useMutation } from "@tanstack/react-query";
import * as authApi from "../api/auth.api";
import { SignInFormData } from "../schemas";
import { ApiError } from "@/lib/http/types/api-error.types";

export const useLogin = () => {
  return useMutation<
    { success: boolean; message: string },
    ApiError,
    SignInFormData
  >({
    mutationFn: authApi.login,
  });
};
