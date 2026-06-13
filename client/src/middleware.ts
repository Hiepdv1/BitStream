import { NextRequest, NextResponse } from "next/server";
import { handleRouting, refreshSession } from "./lib/middlewares";

export default async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  const { hasSession, updatedResponse } = await refreshSession(req, res);

  const redirectRes = handleRouting(req, hasSession);
  if (redirectRes) {
    return redirectRes;
  }

  return updatedResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
