import React from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/react-query";
import { MainLayout } from "@/components/layout/main/MainLayout";
import { getProfile } from "@/features/auth/api/auth.api";
import { cookies } from "next/headers";
import { QUERY_KEYS, QUERY_OPTIONS } from "@/hooks";

export default async function LayoutMain({
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
      <MainLayout>{children}</MainLayout>
    </HydrationBoundary>
  );
}
