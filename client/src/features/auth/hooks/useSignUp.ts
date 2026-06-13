import { useMutation } from "@tanstack/react-query";
import * as authApi from "../api/auth.api";
import { SignUpFormData } from "../schemas";
import { ApiError } from "@/lib/http/types/api-error.types";
import { MutationOptions } from "@/lib/react-query/type";

export type UseRegisterOptions = MutationOptions<
  Awaited<ReturnType<typeof authApi.register>>,
  SignUpFormData
>;

export const useRegister = (options?: UseRegisterOptions) => {
  return useMutation({
    mutationFn: authApi.register,
    ...options,
  });
};
