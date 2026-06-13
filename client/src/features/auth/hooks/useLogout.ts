import { useMutation } from "@tanstack/react-query";
import * as authApi from "../api/auth.api";
import { ApiError } from "@/lib/http/types/api-error.types";
import { MutationOptions } from "@/lib/react-query/type";

export type LogoutMutationOptions = MutationOptions<
  Awaited<ReturnType<typeof authApi.logout>>,
  null,
  ApiError
>;

export default function useLogout(optional?: LogoutMutationOptions) {
  return useMutation({
    mutationFn: authApi.logout,
    ...optional,
  });
}
