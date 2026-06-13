"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Radio,
  Receipt,
  Gift,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Streams", href: "/admin/streams", icon: Radio },
  { label: "Transactions", href: "/admin/transactions", icon: Receipt },
  { label: "Gift Management", href: "/admin/gifts", icon: Gift },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "h-full bg-background border-r border-border flex flex-col shrink-0 transition-all duration-300 ease-in-out relative",
          collapsed ? "w-[72px]" : "w-[260px]",
        )}
      >
        {/* Brand Logo */}
        <div className={cn("p-4", collapsed ? "px-3" : "px-6 pt-6")}>
          <Link
            href="/admin/dashboard"
            className="block outline-none text-brand font-heading font-black text-xl tracking-tight leading-tight"
          >
            {collapsed ? (
              <span className="flex items-center justify-center text-2xl">
                B
              </span>
            ) : (
              <>
                BitStream Admin
                <span className="block text-text-muted text-xs font-medium font-sans mt-0.5 tracking-normal">
                  System Control
                </span>
              </>
            )}
          </Link>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors outline-none",
                  collapsed ? "justify-center p-3" : "px-3 py-2.5",
                  isActive
                    ? "bg-brand/10 text-brand"
                    : "text-text-muted hover:bg-surface-hover hover:text-text-main",
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        {/* Admin Profile */}
        <div className="p-3 border-t border-border mt-auto">
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed ? "justify-center" : "px-2",
            )}
          >
            <div className="w-9 h-9 rounded-full bg-brand/20 border border-brand/30 overflow-hidden shrink-0 flex items-center justify-center">
              <span className="text-brand font-bold text-sm">A</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-text-main truncate">
                  Admin
                </h4>
                <p className="text-xs text-text-muted truncate">System Lead</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={onToggle}
          className={cn(
            "absolute -right-3 top-20 w-6 h-6 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer z-10",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronsLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </aside>
    </TooltipProvider>
  );
}
