import { getProfile } from "@/features/auth/api/auth.api";
import { Permission } from "@/helpers";
import { redirect } from "next/navigation";
import React from "react";

interface LayoutStreamProps {
  children?: React.ReactNode;
}

const LayoutStream = async ({ children }: LayoutStreamProps) => {
  try {
    const profile = await getProfile();

    if (!profile) throw new Error("Unauthorized");

    if (Permission.is.viewer(profile.role)) {
      throw new Error("Forbidden");
    }

    return <div>{children}</div>;
  } catch {
    return redirect("/sign-in");
  }
};

export default LayoutStream;
