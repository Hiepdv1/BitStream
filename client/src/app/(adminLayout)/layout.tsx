"use client";

import { Suspense, useState } from "react";
import { AdminSidebar } from "@/components/layout/admin/AdminSidebar";
import { AdminHeader } from "@/components/layout/admin/AdminHeader";
import AdminHeaderSkeleton from "@/components/layout/admin/AdminHeaderSkeleton";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-surface overflow-hidden relative font-sans text-text-main">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Suspense fallback={<AdminHeaderSkeleton />}>
          <AdminHeader />
        </Suspense>
        <main className="flex-1 overflow-y-auto w-full p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
