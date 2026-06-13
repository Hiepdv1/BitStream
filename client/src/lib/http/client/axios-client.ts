import axios from "axios";
import { isTokenNearExpiry, isRefreshTokenValid } from "@/lib/auth/tokenUtils";
import { tryRefreshToken } from "@/lib/auth/refreshToken";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api",
  timeout: 10000,
  withCredentials: true,
});

async function getCookieHeader() {
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    return (await cookies()).toString();
  }
  return document.cookie;
}

api.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") {
    config.headers.Cookie = await getCookieHeader();
  } else {
    if (config.url && !config.url.includes("/auth/refresh")) {
      if (isRefreshTokenValid() && isTokenNearExpiry()) {
        await tryRefreshToken();
      }
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error);
  },
);
