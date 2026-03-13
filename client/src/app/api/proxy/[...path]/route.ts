import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthIdentity } from "@/features/auth/utils/auth-provider";
import { generateSecurityHeaders } from "@/lib/http/server/serverFetch";
import { cookies } from "next/headers";

export async function processProxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const backendUrl = `${process.env.BACKEND_API_URL}/${path.join("/")}`;
    const url = new URL(req.url);
    const searchParams = url.search;

    const targetUrl = `${backendUrl}${searchParams}`;

    const session = await auth();

    // Reconstruct body
    let bodyText = "";
    if (req.method !== "GET" && req.method !== "HEAD") {
      try {
        bodyText = await req.text();
      } catch (e) {
        // no body
      }
    }

    const securityHeaders = await generateSecurityHeaders(
      req.method,
      `/${path.join("/")}${searchParams}`,
      bodyText || {},
    );

    const authHeaders: Record<string, string> = {};

    if (session?.provider) {
      const { provider: authProvider, token } = getAuthIdentity(session);
      if (token) {
        authHeaders["Authorization"] = `Bearer ${token}`;
      }
      authHeaders["X-Provider"] = authProvider;
    }

    const headers = new Headers();
    req.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== "host" &&
        lowerKey !== "cookie" &&
        lowerKey !== "connection"
      ) {
        headers.set(key, value);
      }
    });

    Object.entries(securityHeaders).forEach(([k, v]) =>
      headers.set(k, v as string),
    );

    Object.entries(authHeaders).forEach(([k, v]) =>
      headers.set(k, v as string),
    );

    headers.set("cookie", (await cookies()).toString());

    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: bodyText ? bodyText : undefined,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    const responseData = await res.arrayBuffer();

    return new NextResponse(responseData, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("[Next.js Proxy Error]:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

export const GET = processProxy;
export const POST = processProxy;
export const PUT = processProxy;
export const PATCH = processProxy;
export const DELETE = processProxy;
