"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
}

export function MainLayout({
  children,
  showFooter = true,
  className,
}: MainLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-background relative selection:bg-brand/30 selection:text-white">
      <Header />
      <main className={cn("flex-1 flex flex-col w-full", className)}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
