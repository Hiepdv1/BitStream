"use client";

import {
  Home,
  CheckCircle,
  Radio,
  LayoutGrid,
  List,
  X,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand";
import { useProfile } from "@/features/auth/hooks/useProfile";
import useLogout from "@/features/auth/hooks/useLogout";
import { clearAuthExpiries } from "@/lib/auth/tokenUtils";
import { useAppQueryClient } from "@/hooks";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Browse", href: "/browse", icon: CheckCircle },
  { name: "Live", href: "/live", icon: Radio, badge: "HOT" },
  { name: "Categories", href: "/categories", icon: LayoutGrid },
  { name: "My List", href: "/my-list", icon: List },
];

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const { data: user } = useProfile();
  const router = useRouter();
  const logout = useLogout();
  const { clearAll } = useAppQueryClient();

  if (!isOpen) return null;

  const onLogout = () => {
    logout.mutate(null, {
      onSuccess: () => {
        clearAuthExpiries();
        clearAll();
        onClose();
        router.push("/sign-in");
      },
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 z-1000 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-0 left-0 w-[280px] h-full bg-white dark:bg-background z-1001 flex flex-col border-r border-border shadow-2xl animate-in slide-in-from-left duration-300">
        <div className="relative flex h-16 items-center justify-between px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <Logo className="w-6 h-6 text-brand" />
            <span className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              BitStream
            </span>
          </Link>
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-1 cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "text-[#FF5C00] bg-[#FF5C00]/10"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5",
                )}
              >
                <link.icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive
                      ? "text-[#FF5C00]"
                      : "text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-400",
                  )}
                />
                <span className="flex-1">{link.name}</span>
                {link.badge && (
                  <span className="text-[10px] font-bold bg-brand text-white px-2 py-0.5 rounded-full uppercase">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border space-y-4">
          <div className="text-xs font-semibold text-zinc-500 tracking-wider uppercase px-2 mb-2">
            Account
          </div>
          {user ? (
            <div className="bg-zinc-50 dark:bg-white/5 rounded-xl p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-brand to-brand-hover flex items-center justify-center text-white font-bold text-lg">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name || "User"}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    (user.name?.[0] || user.email[0]).toUpperCase()
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                    {user.name || "User"}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {user.email}
                  </div>
                </div>
              </div>
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <UserIcon className="w-4 h-4" /> Profile
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="flex cursor-pointer items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 px-2">
              <Link
                href="/sign-in"
                prefetch={false}
                onClick={onClose}
                className="flex flex-col items-center justify-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors py-2 bg-zinc-50 dark:bg-white/5 rounded-lg"
              >
                <div>
                  <LogOut className="w-5 h-5 rotate-180 mb-2 mx-auto" /> Login
                </div>
              </Link>
              <Link
                href="/sign-up"
                prefetch={false}
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full bg-brand hover:bg-brand-hover text-white"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
