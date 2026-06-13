import { UserRole } from "@/enums";
import { getProfile } from "@/features/auth/api/auth.api";
import { getQueryClient } from "@/lib/react-query";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  try {
    const profile = await queryClient.fetchQuery({
      queryKey: ["user-profile"],
      queryFn: getProfile,
    });

    if (!profile) {
      throw new Error("Unauthorized");
    }

    const allowedRoles = UserRole.ADMIN;
    if ((profile.role & allowedRoles) === 0) {
      throw new Error("Forbidden");
    }
  } catch {
    redirect("/sign-in");
  }

  return <div>{children}</div>;
}
