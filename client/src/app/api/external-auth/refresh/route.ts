import { serverFetch } from "@/lib/http/server/serverFetch";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const result = await serverFetch<null>(
    "/auth/refresh",
    {},
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
    false
  );

  return NextResponse.json(result, {
    status: result.status,
  });
}
