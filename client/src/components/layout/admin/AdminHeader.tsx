"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useSuspenseProfile } from "@/features/auth/hooks/useProfile";
import useLogout from "@/features/auth/hooks/useLogout";
import { UserProfile } from "@/features/auth/types/auth";
import { clearAuthExpiries } from "@/lib/auth/tokenUtils";
import { useAppQueryClient } from "@/hooks";

/* ── Theme Toggle (copied from client Header) ── */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!mounted) return <div className="w-9 h-9" />;

  const icon =
    theme === "dark" ? (
      <Moon className="h-5 w-5" />
    ) : theme === "light" ? (
      <Sun className="h-5 w-5" />
    ) : (
      <Monitor className="h-5 w-5" />
    );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer relative p-2 rounded-md text-text-muted hover:text-text-main hover:bg-surface-hover transition-all"
        aria-label="Toggle theme"
      >
        {icon}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {[
            { value: "light", label: "Light", Icon: Sun },
            { value: "dark", label: "Dark", Icon: Moon },
            { value: "system", label: "System", Icon: Monitor },
          ].map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors cursor-pointer",
                theme === value
                  ? "text-brand bg-brand/10 font-bold"
                  : "text-text-secondary hover:bg-surface-hover",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── User Dropdown (copied from client Header) ── */
function UserDropdown({ user }: { user: UserProfile }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const logout = useLogout();
  const { clearAll } = useAppQueryClient();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const onLogout = () => {
    logout.mutate(null, {
      onSuccess: () => {
        clearAuthExpiries();
        clearAll();
        setOpen(false);
        router.push("/sign-in");
      },
      onError: () => {
        setOpen(false);
      },
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer group flex items-center p-1 rounded-full hover:bg-surface-hover transition-all outline-none ml-1"
      >
        <div className="h-8 w-8 rounded-full bg-linear-to-br from-brand to-brand-hover flex items-center justify-center text-white text-sm font-bold">
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
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 py-2">
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-linear-to-br from-brand to-brand-hover flex items-center justify-center text-white text-base font-bold">
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
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-text-main truncate">
                {user.name || "Guest"}
              </span>
              <span className="text-xs text-text-muted truncate">
                {user.email}
              </span>
            </div>
          </div>

          <div className="py-2">
            <Link
              onClick={() => setOpen(false)}
              href="/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-main transition-colors"
            >
              <User className="w-4 h-4" /> Profile
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="/settings"
              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-main transition-colors"
            >
              <Settings className="w-4 h-4" /> Settings
            </Link>
          </div>

          <div className="border-t border-border py-2">
            <button
              onClick={onLogout}
              className="cursor-pointer w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-surface-hover transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Admin Header ── */
export function AdminHeader() {
  const { data: user } = useSuspenseProfile();

  return (
    <header className="h-16 w-full bg-background border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full h-10 pl-10 pr-4 bg-surface border border-border rounded-lg text-sm text-text-main placeholder:text-text-muted outline-none focus:ring-2 focus:ring-brand/50 transition-shadow"
          />
        </div>
      </div>

      {/* Right: Theme + Bell + Avatar */}
      <div className="flex items-center gap-2 ml-6">
        <ThemeToggle />

        <button className="relative p-2 rounded-md text-text-muted hover:text-text-main hover:bg-surface-hover transition-all cursor-pointer">
          <Bell className="w-5 h-5" />
        </button>

        {user && <UserDropdown user={user} />}
      </div>
    </header>
  );
}
