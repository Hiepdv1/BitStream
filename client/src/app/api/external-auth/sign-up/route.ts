import { validateJson } from "@/lib/http/validateRequest";
import { signUpSchema } from "@/features/auth/schemas";
import { serverFetch } from "@/lib/http/server/serverFetch";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { data, error } = await validateJson(req, signUpSchema);

  if (error) {
    return NextResponse.json(error, {
      status: error.status,
    });
  }

  const backendRes = await serverFetch(
    "/auth/sign-up",
    {},
    {
      method: "POST",
      body: JSON.stringify({
        fullName: data?.fullName,
        email: data?.email,
        password: data?.password,
        confirmPassword: data?.confirmPassword,
      }),
    },
    false
  );

  return NextResponse.json(backendRes, {
    status: backendRes.status,
  });
}
