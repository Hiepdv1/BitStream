import React from "react";
import HeaderOnlyLayout from "@/components/layout/main/HeaderOnlyLayout";
import { getProfile } from "@/features/auth/api/auth.api";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { QUERY_KEYS, QUERY_OPTIONS } from "@/hooks";

export default async function LayoutHeaderOnly({
  children,
}: {
  children: React.ReactNode;
}) {
  await cookies();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE],
    queryFn: getProfile,
    ...QUERY_OPTIONS.USER_PROFILE,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HeaderOnlyLayout>{children}</HeaderOnlyLayout>
    </HydrationBoundary>
  );
}
