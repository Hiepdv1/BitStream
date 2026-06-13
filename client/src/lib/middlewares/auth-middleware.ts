import { NextRequest, NextResponse } from "next/server";
import {
  CLIENT_ACCESS_EXP_KEY,
  CLIENT_REFRESH_EXP_KEY,
} from "@/lib/auth/tokenUtils";
import { AuthTokenPayload } from "@/features/auth/types/auth";

const clearCookies = (res: NextResponse) => {
  const cookiesToClear = [
    "access_token",
    "refresh_token",
    CLIENT_ACCESS_EXP_KEY,
    CLIENT_REFRESH_EXP_KEY,
  ];

  cookiesToClear.forEach((name) => {
    res.cookies.set(name, "", { path: "/", expires: new Date(0), maxAge: 0 });
  });
};

export async function refreshSession(req: NextRequest, res: NextResponse) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const accessToken = req.cookies.get("access_token")?.value;
  const accessExp = req.cookies.get(CLIENT_ACCESS_EXP_KEY)?.value;

  const nowInSecs = Math.floor(Date.now() / 1000);
  const thresholdSecs = 60;

  const isTokenNearExpiry =
    !accessExp || !accessToken || Number(accessExp) < nowInSecs + thresholdSecs;

  if (isTokenNearExpiry && refreshToken) {
    try {
      const response = await fetch(
        `${process.env.BACKEND_API_URL}/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `refresh_token=${refreshToken}`,
          },
        },
      );

      if (!response.ok) throw new Error("Refresh failed at Backend");

      const setCookieHeaders = response.headers.getSetCookie();
      for (const cookieStr of setCookieHeaders) {
        res.headers.append("Set-Cookie", cookieStr);
        req.headers.append("Cookie", cookieStr);
      }

      const json = await response.json();
      const data = json.data as AuthTokenPayload;

      const accessMaxAge = data.accessTokenExpiresAt - nowInSecs;
      const refreshMaxAge = data.refreshTokenExpiresAt - nowInSecs;

      const accessExpCookie = `${CLIENT_ACCESS_EXP_KEY}=${data.accessTokenExpiresAt}; Path=/; Max-Age=${accessMaxAge}; SameSite=Lax`;
      const refreshExpCookie = `${CLIENT_REFRESH_EXP_KEY}=${data.refreshTokenExpiresAt}; Path=/; Max-Age=${refreshMaxAge}; SameSite=Lax`;

      res.headers.append("Set-Cookie", accessExpCookie);
      res.headers.append("Set-Cookie", refreshExpCookie);

      return { hasSession: true, updatedResponse: res };
    } catch (error) {
      clearCookies(res);
      return { hasSession: false, updatedResponse: res };
    }
  }

  return { hasSession: !isTokenNearExpiry, updatedResponse: res };
}
