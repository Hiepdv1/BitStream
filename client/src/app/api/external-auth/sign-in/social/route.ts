import { serverFetch } from "@/lib/http/server/serverFetch";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const result = await serverFetch<null>(
    "/auth/sign-in/social",
    {},
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...req.headers,
      },
    },
    false
  );

  return NextResponse.json(result, {
    status: result.status,
  });
}
