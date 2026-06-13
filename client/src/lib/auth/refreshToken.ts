import axios from "axios";
import { setAuthExpiries, clearAuthExpiries } from "./tokenUtils";
import { AuthTokenPayload } from "@/features/auth/types/auth";

let isRefreshing = false;
let pendingRefreshPromise: Promise<boolean> | null = null;

export async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing && pendingRefreshPromise) {
    return pendingRefreshPromise;
  }

  isRefreshing = true;
  pendingRefreshPromise = (async () => {
    try {
      const response = await axios.post<{ data: AuthTokenPayload }>(
        `${process.env.NEXT_PUBLIC_API_BASE}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const payload = response.data.data;
      if (
        payload &&
        payload.accessTokenExpiresAt &&
        payload.refreshTokenExpiresAt
      ) {
        setAuthExpiries(
          payload.accessTokenExpiresAt,
          payload.refreshTokenExpiresAt,
        );
        return true;
      }
      return false;
    } catch (error) {
      clearAuthExpiries();
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }
      return false;
    } finally {
      isRefreshing = false;
      pendingRefreshPromise = null;
    }
  })();

  return pendingRefreshPromise;
}
