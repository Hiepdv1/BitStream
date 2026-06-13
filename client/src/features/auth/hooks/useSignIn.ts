import { useMutation } from "@tanstack/react-query";
import * as authApi from "../api/auth.api";
import { SignInFormData } from "../schemas";
import { MutationOptions } from "@/lib/react-query/type";

type LoginMutationOptions = MutationOptions<
  Awaited<ReturnType<typeof authApi.login>>,
  SignInFormData
>;

export const useLogin = (options?: LoginMutationOptions) => {
  return useMutation({
    mutationFn: authApi.login,
    ...options,
  });
};
