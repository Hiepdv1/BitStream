"use server";

import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { buildQuery } from "./buildQuery";
import { LoadSignatureKeys } from "./signature/loadKeys";
import { CreateSignature } from "./signature/signature";
import { getAuthIdentity } from "@/features/auth/utils/auth-provider";
import { normalizeError } from "../normalize/normalize-error";
import { normalizeSuccess } from "../normalize/normalize-success";
import { NormalizedResponse } from "../normalize/types";

const keys = LoadSignatureKeys();

export async function generateSecurityHeaders(
  method: string,
  uri: string,
  body: any,
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
    },
  );

  return {
    "X-Key-Id": key.Id,
    "X-Timestamp": timestamp,
    "X-Nonce": nonce,
    "X-Signature": signature,
    "Content-Type": "application/json",
  };
}

export async function serverFetch<T = any>(
  path: string,
  params?: Record<string, string>,
  options: RequestInit = {},
  isEnsureAuth = true,
): Promise<NormalizedResponse<T>> {
  try {
    const method = options.method || "GET";
    const uri = `${path}${buildQuery(params)}`;
    const session = await auth();

    if (isEnsureAuth && !session) {
      return normalizeError({ message: "Unauthorized" }, 401);
    }

    const securityHeaders = await generateSecurityHeaders(
      method,
      uri,
      options.body,
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
        cookie: (await cookies()).toString(),
      },
      cache: "no-store",
    });

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
