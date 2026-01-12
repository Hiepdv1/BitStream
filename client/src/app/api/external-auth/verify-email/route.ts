import { validateJson } from "@/lib/http/validateRequest";
import { serverFetch } from "@/lib/http/server/serverFetch";
import { NextRequest, NextResponse } from "next/server";
import { VerifyEmailSchema } from "@/features/auth/schemas/verify-email.schema";

export async function POST(req: NextRequest) {
  const { data, error } = await validateJson(req, VerifyEmailSchema);

  if (error) {
    return NextResponse.json(error, {
      status: error.status,
    });
  }

  const backendRes = await serverFetch(
    "/auth/verify-email",
    {},
    {
      method: "POST",
      body: JSON.stringify({
        token: data?.token,
      }),
    },
    true
  );

  return NextResponse.json(backendRes, {
    status: backendRes.status,
  });
}
