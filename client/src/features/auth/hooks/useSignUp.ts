import { useMutation } from "@tanstack/react-query";
import * as authApi from "../api/auth.api";
import { useAuthStore } from "../stores/useAuthStore";
import { useRouter } from "next/navigation";
import { SignUpFormData } from "../schemas";
import { ApiError } from "@/lib/http/types/api-error.types";
import { AuthTokenPayload } from "../types/auth";

export const useRegister = () => {
  const router = useRouter();
  const setVerifying = useAuthStore((state) => state.setVerifying);

  return useMutation<AuthTokenPayload, ApiError, SignUpFormData>({
    mutationFn: authApi.register,
    onSuccess: () => {
      setVerifying(true);
      router.push("/verify-email");
    },
  });
};
