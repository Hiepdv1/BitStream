import { getCookie, setCookie, deleteCookie } from "cookies-next";

export const CLIENT_ACCESS_EXP_KEY = "client_access_exp";
export const CLIENT_REFRESH_EXP_KEY = "client_refresh_exp";

export const REFRESH_THRESHOLD_SECS = 60;

export function setAuthExpiries(accessExp: number, refreshExp: number) {
  if (typeof document === "undefined") return;

  setCookie(CLIENT_ACCESS_EXP_KEY, accessExp, {
    path: "/",
    expires: new Date(refreshExp * 1000),
    sameSite: "lax",
    httpOnly: false,
  });

  setCookie(CLIENT_REFRESH_EXP_KEY, refreshExp, {
    path: "/",
    expires: new Date(refreshExp * 1000),
    sameSite: "lax",
    httpOnly: false,
  });
}

export function clearAuthExpiries() {
  if (typeof document === "undefined") return;
  deleteCookie(CLIENT_ACCESS_EXP_KEY, { path: "/" });
  deleteCookie(CLIENT_REFRESH_EXP_KEY, { path: "/" });
}

export function getAccessTokenExpiry(): number | null {
  if (typeof document === "undefined") return null;
  const val = getCookie(CLIENT_ACCESS_EXP_KEY);
  if (!val) return null;
  const num = parseInt(val as string, 10);
  return isNaN(num) ? null : num;
}

export function getRefreshTokenExpiry(): number | null {
  if (typeof document === "undefined") return null;
  const val = getCookie(CLIENT_REFRESH_EXP_KEY);
  if (!val) return null;
  const num = parseInt(val as string, 10);
  return isNaN(num) ? null : num;
}

export function isTokenExpired(): boolean {
  const exp = getAccessTokenExpiry();
  if (exp === null) return true;
  return exp < Math.floor(Date.now() / 1000);
}

export function isTokenNearExpiry(): boolean {
  const exp = getAccessTokenExpiry();
  if (exp === null) return true;
  return exp < Math.floor(Date.now() / 1000) + REFRESH_THRESHOLD_SECS;
}

export function isRefreshTokenValid(): boolean {
  const exp = getRefreshTokenExpiry();
  if (exp === null) return false;
  return exp > Math.floor(Date.now() / 1000);
}

export function hasActiveSession(): boolean {
  return isRefreshTokenValid();
}
