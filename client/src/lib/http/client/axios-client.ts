import axios from "axios";
import { getSession } from "next-auth/react";
import { getCookie } from "cookies-next";
import { getAuthIdentity } from "@/features/auth/utils/auth-provider";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  timeout: 10000,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
  failedQueue = [];
};

api.interceptors.request.use(async (config) => {
  if (config.url?.startsWith("/proxy")) {
    config.baseURL = "/api";
    config.url = config.url.replace("/proxy", "");
  }

  if (config.url?.includes("/external-auth/refresh")) return config;

  const expiresAt = Number(getCookie("auth_session_exp"));
  const isExpired = expiresAt && Date.now() / 1000 + 30 >= expiresAt;

  if (isExpired) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve: () => resolve(config), reject });
      });
    }

    isRefreshing = true;
    try {
      await axios.post("/api/external-auth/refresh");
      isRefreshing = false;
      processQueue();
    } catch (err) {
      isRefreshing = false;
      failedQueue = [];
      window.location.href = "/sign-in";
      return Promise.reject(err);
    }
  }

  const session = await getSession();
  if (session?.provider) {
    const { provider, token } = getAuthIdentity(session);
    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["X-Provider"] = provider;
  }

  return config;
});
