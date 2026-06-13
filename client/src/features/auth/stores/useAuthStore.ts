// import { create } from "zustand";
// import { UserProfile } from "../types/auth";
// import { getProfile } from "../api/auth.api";

// interface AuthState {
//   isVerifying: boolean;
//   setVerifying: (isVerifying: boolean) => void;
//   returnUrl: string | null;
//   setReturnUrl: (url: string | null) => void;
//   user: UserProfile | null;
//   isLoadingUser: boolean;
//   fetchUser: () => Promise<void>;
//   setUser: (user: UserProfile | null) => void;
// }

// export const useAuthStore = create<AuthState>()((set) => ({
//   isVerifying: false,
//   setVerifying: (isVerifying) => set({ isVerifying }),
//   returnUrl: null,
//   setReturnUrl: (returnUrl) => set({ returnUrl }),
//   user: null,
//   isLoadingUser: true,
//   fetchUser: async () => {
//     try {
//       set({ isLoadingUser: true });
//       const user = await getProfile();
//       set({ user, isLoadingUser: false });
//     } catch (error) {
//       set({ user: null, isLoadingUser: false });
//     }
//   },
//   setUser: (user) => set({ user }),
// }));
