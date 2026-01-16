"use server";

import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { buildQuery } from "./buildQuery";
import { LoadSignatureKeys } from "./signature/loadKeys";
import { CreateSignature } from "./signature/signature";
import {
  getAuthIdentity,
  getAuthProvider,
} from "@/features/auth/utils/auth-provider";
import { PROVIDER_TYPES } from "@/features/auth/enum";
import { normalizeError } from "../normalize/normalize-error";
import { normalizeSuccess } from "../normalize/normalize-success";
import { parse } from "set-cookie-parser";
import { NormalizedResponse } from "../normalize/types";

const keys = LoadSignatureKeys();

export async function generateSecurityHeaders(
  method: string,
  uri: string,
  body: any
) {
  const bodyRaw = typeof body === "string" ? body : JSON.stringify(body || {});
  const key = keys[Math.floor(Math.random() * keys.length)];

  const { signature, timestamp, nonce } = await CreateSignature(
    method,
    uri,
    bodyRaw,
    {
      KeyId: key.Id,
      Secret: key.Secret,
    }
  );

  return {
    "X-Key-Id": key.Id,
    "X-Timestamp": timestamp,
    "X-Nonce": nonce,
    "X-Signature": signature,
    "Content-Type": "application/json",
  };
}

async function forwardCookies(res: Response): Promise<string> {
  const setCookieHeaders = res.headers.getSetCookie();
  if (!setCookieHeaders || setCookieHeaders.length === 0) return "";

  const cookieStore = await cookies();
  const splitCookies = parse(setCookieHeaders);

  const cookieArray: string[] = [];

  for (const cookie of splitCookies) {
    const {
      name,
      value,
      expires,
      maxAge,
      path,
      domain,
      secure,
      httpOnly,
      sameSite,
    } = cookie;

    const cookieOptions: any = {
      path: path || "/",
      sameSite: (sameSite?.toLowerCase() as "lax" | "strict" | "none") || "lax",
      httpOnly: !!httpOnly,
      secure: secure || process.env.NODE_ENV === "production",
    };

    if (maxAge) {
      cookieOptions.maxAge = maxAge;
    } else if (expires) {
      cookieOptions.expires = new Date(expires);
    }

    if (domain) cookieOptions.domain = domain;

    cookieStore.delete(name as any);
    cookieStore.set(name, value, cookieOptions);

    cookieArray.push(`${name}=${value}`);
  }

  return cookieArray.join("; ");
}

async function ensureValidToken(
  provider: string | undefined
): Promise<{ isValid: boolean; newCookie?: string }> {
  if (provider !== PROVIDER_TYPES.CREDENTIALS) return { isValid: true };

  const cookieStore = await cookies();
  const expiresAt = Number(cookieStore.get("auth_session_exp")?.value);

  if (isNaN(expiresAt)) return { isValid: false };

  if (Date.now() / 1000 + 60 >= expiresAt) {
    const securityHeaders = await generateSecurityHeaders(
      "POST",
      "/auth/refresh",
      {}
    );

    const refreshRes = await fetch(
      `${process.env.BACKEND_API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          ...securityHeaders,
          cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    if (!refreshRes.ok) {
      cookieStore.delete("auth_session_exp");
      return { isValid: false };
    }

    const newCookie = await forwardCookies(refreshRes);
    return { isValid: true, newCookie };
  }

  return { isValid: true };
}

export async function serverFetch<T = any>(
  path: string,
  params?: Record<string, string>,
  options: RequestInit = {},
  isEnsureAuth = true
): Promise<NormalizedResponse<T>> {
  try {
    const method = options.method || "GET";
    const uri = `${path}${buildQuery(params)}`;
    const session = await auth();

    let currentCookie = (await cookies()).toString();

    if (isEnsureAuth) {
      const authResult = await ensureValidToken(getAuthProvider(session));

      if (!authResult.isValid) {
        return normalizeError({ message: "Unauthorized" }, 401);
      }

      if (authResult.newCookie) {
        currentCookie = authResult.newCookie;
      }
    }

    const securityHeaders = await generateSecurityHeaders(
      method,
      uri,
      options.body
    );
    const authHeaders: Record<string, string> = {};

    if (session?.provider) {
      const { provider: authProvider, token } = getAuthIdentity(session);
      authHeaders["Authorization"] = `Bearer ${token}`;
      authHeaders["X-Provider"] = authProvider;
    }

    const res = await fetch(`${process.env.BACKEND_API_URL}${uri}`, {
      ...options,
      headers: {
        ...options.headers,
        ...securityHeaders,
        ...authHeaders,
        cookie: currentCookie,
      },
      cache: "no-store",
    });

    await forwardCookies(res);

    if (res.status === 204 || res.status === 205) {
      return normalizeSuccess({ message: res.statusText } as any, 200);
    }

    if (!res.ok && res.status === 429) {
      return normalizeError({ message: "Too many requests" }, res.status);
    }

    const json = await res.json().catch(() => null);

    if (!res.ok) return normalizeError(json, res.status);

    return normalizeSuccess<T>(json, res.status);
  } catch (err) {
    return normalizeError(err, 500);
  }
}
