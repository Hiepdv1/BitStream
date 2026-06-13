import { getProfile } from "@/features/auth/api/auth.api";
import { Permission } from "@/helpers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

interface StudioLayoutProps {
  children?: React.ReactNode;
}

const StudioLayout = async ({ children }: StudioLayoutProps) => {
  let profile = null;

  try {
    await cookies();
    profile = await getProfile();
  } catch (error) {}

  if (!profile) {
    redirect("/sign-in");
  }

  if (Permission.is.viewer(profile.role)) {
    redirect("/studio/create");
  }

  return <div>{children}</div>;
};

export default StudioLayout;
