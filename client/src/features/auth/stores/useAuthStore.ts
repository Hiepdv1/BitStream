import { create } from "zustand";

interface AuthState {
  isVerifying: boolean;
  setVerifying: (isVerifying: boolean) => void;
  returnUrl: string | null;
  setReturnUrl: (url: string | null) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isVerifying: false,
  setVerifying: (isVerifying) => set({ isVerifying }),
  returnUrl: null,
  setReturnUrl: (returnUrl) => set({ returnUrl }),
}));
