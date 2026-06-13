import { getProfile } from "@/features/auth/api/auth.api";
import { cookies } from "next/headers";
import { Permission } from "@/helpers";
import { redirect } from "next/navigation";
import React from "react";

interface CreateStudioLayoutProps {
  children?: React.ReactNode;
}

const CreateStudioLayout = async ({ children }: CreateStudioLayoutProps) => {
  let profile = null;

  try {
    await cookies();
    profile = await getProfile();
  } catch {}

  if (!profile) {
    redirect("/sign-in");
  }

  if (Permission.is.studioOwner(profile.role)) {
    redirect(`/studio/${profile.id}`);
  }

  return <div>{children}</div>;
};

export default CreateStudioLayout;
