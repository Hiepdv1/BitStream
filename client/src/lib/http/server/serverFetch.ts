import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { LoadSignatureKeys } from "@/lib/http/server/signature/loadKeys";
import { CreateSignature } from "@/lib/http/server/signature/signature";
import { IBackendResponse } from "@/types/api/backend";

const keys = LoadSignatureKeys();

export async function generateSecurityHeaders(
  method: string,
  uri: string,
  body: unknown,
) {
  const bodyRaw = typeof body === "string" ? body : JSON.stringify(body || {});
  const key = keys[Math.floor(Math.random() * keys.length)];

  const { signature, timestamp, nonce } = await CreateSignature(
    method,
    uri,
    bodyRaw,
    { KeyId: key.Id, Secret: key.Secret },
  );

  return {
    "X-Key-Id": key.Id,
    "X-Timestamp": timestamp,
    "X-Nonce": nonce,
    "X-Signature": signature,
    "Content-Type": "application/json",
  };
}

export async function serverFetch<T = null>(
  path: string,
  params?: Record<string, string>,
  options: RequestInit = {},
  isEnsureAuth = true,
): Promise<IBackendResponse<T>> {
  try {
    const method = options.method || "GET";
    const query =
      params && Object.keys(params).length
        ? "?" + new URLSearchParams(params).toString()
        : "";
    const uri = `${path}${query}`;

    if (isEnsureAuth) {
      const cookieStore = await cookies();
      const hasToken = cookieStore.has("access_token");
      if (!hasToken) {
        return {
          success: false,
          statusCode: 401,
          data: null,
          error: "Unauthorized",
          message: "Unauthorized",
        };
      }
    }

    const cookieStore = await cookies();
    const securityHeaders = await generateSecurityHeaders(
      method,
      uri,
      options.body,
    );

    const res = await fetch(`${process.env.BACKEND_API_URL}${uri}`, {
      ...options,
      headers: {
        ...options.headers,
        ...securityHeaders,
        cookie: cookieStore.toString(),
      },
      cache: "no-store",
    });

    if (res.status === 204 || res.status === 205) {
      return {
        success: true,
        statusCode: 200,
        data: null,
        message: "No Content",
      };
    }

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        success: false,
        statusCode: res.status,
        data: null,
        error: json,
        message: json?.data?.message || json?.message || "Error",
      };
    }
    return {
      success: true,
      statusCode: res.status,
      data: (json?.data || json) as T,
      message: json?.data?.message || json?.message || "Success",
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 500,
      data: null,
      error: JSON.stringify(err),
      message: "Internal Server Error",
    };
  }
}

export async function proxyToBackend(
  path: string,
  options: RequestInit & { body?: string },
  req?: NextRequest,
): Promise<NextResponse> {
  try {
    const method = options.method || "POST";
    const securityHeaders = await generateSecurityHeaders(
      method,
      path,
      options.body,
    );

    const cookieStore = await cookies();
    const forwardCookies = req
      ? req.headers.get("cookie") || cookieStore.toString()
      : cookieStore.toString();

    const res = await fetch(`${process.env.BACKEND_API_URL}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        ...securityHeaders,
        cookie: forwardCookies,
      },
      cache: "no-store",
    });

    const responseData = await res.arrayBuffer();

    const nextRes = new NextResponse(responseData, {
      status: res.status,
      statusText: res.statusText,
    });

    const ct = res.headers.get("content-type");
    if (ct) nextRes.headers.set("content-type", ct);

    res.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        nextRes.headers.append("set-cookie", value);
      }
    });

    return nextRes;
  } catch (err: unknown) {
    console.error("[proxyToBackend error]:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
