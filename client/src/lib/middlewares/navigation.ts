import { NextRequest, NextResponse } from "next/server";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/lib/middlewares";

export function handleRouting(req: NextRequest, hasSession: boolean) {
  const { pathname } = req.nextUrl;

  const isAuthRoute = AUTH_ROUTES.some((p) => p.test(pathname));
  const isProtectedRoute = PROTECTED_ROUTES.some((p) => p.test(pathname));

  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return null;
}
