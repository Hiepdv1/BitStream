import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = [/^\/sign-in(\/.*)?$/, /^\/sign-up(\/.*)?$/];

const PROTECTED_ROUTES = [
  /^\/dashboard(\/.*)?$/,
  /^\/stream(\/.*)?$/,
  /^\/settings(\/.*)?$/,
  /^\/verify-email(\/.*)?$/,
];

function matchRoute(req: NextRequest, patterns: RegExp[]) {
  const pathname = new URL(req.url).pathname;
  return patterns.some((p) => p.test(pathname));
}

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const authExp = req.cookies.get("auth_session_exp")?.value;

  if (matchRoute(req, PROTECTED_ROUTES) && !isLoggedIn && !authExp) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  if (matchRoute(req, AUTH_ROUTES) && (isLoggedIn || authExp)) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
