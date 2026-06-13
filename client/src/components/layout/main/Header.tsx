"use client";

import {
  Search,
  Bell,
  Menu,
  Sun,
  Moon,
  Monitor,
  User,
  LayoutDashboard,
  Bookmark,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef, Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Logo } from "@/components/brand";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./MobileSidebar";
import {
  useProfile,
  useSuspenseProfile,
} from "@/features/auth/hooks/useProfile";
import useMediaQuery from "@/hooks/use-media-query";
import useLogout from "@/features/auth/hooks/useLogout";
import { UserProfile } from "@/features/auth/types/auth";
import { clearAuthExpiries } from "@/lib/auth/tokenUtils";
import { useAppQueryClient } from "@/hooks";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Browse", href: "/browse" },
  { name: "Live", href: "/live", isHot: true },
  { name: "Categories", href: "/categories" },
  { name: "My List", href: "/my-list" },
];

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
        className="cursor-pointer relative p-2 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 dark:hover:text-white  dark:hover:bg-white/6 transition-all"
        aria-label="Toggle theme"
      >
        {icon}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
                "flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors",
                theme === value
                  ? "text-brand bg-brand/10 font-bold"
                  : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/6",
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

  const avatarUrl = `${process.env.NEXT_PUBLIC_ASSET_URL}/avatar/${user.avatarUrl}`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer group flex items-center p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-white/10 transition-all outline-none ml-1"
      >
        <div className="h-8 w-8 rounded-full bg-linear-to-br from-brand to-brand-hover flex items-center justify-center text-white text-sm font-bold">
          {user.avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user.name || "User"}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            (user.name?.[0] || user.email[0]).toUpperCase()
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 py-2">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-linear-to-br from-brand to-brand-hover flex items-center justify-center text-white text-base font-bold">
              {user.avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name || "User"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (user.name?.[0] || user.email[0]).toUpperCase()
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate">
                {user.name || "Guest"}
              </span>
              <span className="text-xs text-zinc-400 truncate">
                {user.email}
              </span>
            </div>
          </div>

          <div className="py-2">
            <Link
              onClick={() => setOpen(false)}
              href="/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" /> Profile
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" /> Creator Dashboard
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="/watchlist"
              className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Bookmark className="w-4 h-4" /> My Watchlist
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="/settings"
              className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" /> Settings
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="/billing"
              className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <CreditCard className="w-4 h-4" /> Subscription / Billing
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href={`/studio/${user.id}`}
              className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Monitor className="w-4 h-4" /> Studio
            </Link>
          </div>

          <div className="border-t border-zinc-800 py-2">
            <button
              onClick={onLogout}
              className="cursor-pointer w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const { data: user } = useSuspenseProfile();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const avatarUrl = `${process.env.NEXT_PUBLIC_ASSET_URL}/avatar/${user?.avatarUrl}`;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 border-b",
          scrolled
            ? "bg-white/95 dark:bg-background/95 backdrop-blur-md border-zinc-200 dark:border-border shadow-sm"
            : "bg-white dark:bg-background border-transparent",
        )}
      >
        <nav className="mx-auto flex h-14 max-w-[1920px] items-center justify-between px-4 lg:px-6">
          {/* Left: Logo & Desktop Nav */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-transform hover:scale-105"
            >
              <Logo className="w-7 h-7 text-brand" />
              <span className="text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-white/80 tracking-tight hidden sm:block">
                BitStream
              </span>
            </Link>

            <div className="hidden xl:flex xl:gap-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-colors rounded-md",
                    pathname === link.href
                      ? "text-zinc-900 dark:text-white"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200",
                  )}
                >
                  {link.name}
                  {link.isHot && (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand text-white uppercase tracking-wider relative -top-0.5">
                      HOT
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Center: Search */}
          <div className="hidden sm:flex flex-1 max-w-md mx-8">
            <div className="flex items-center w-full bg-zinc-100 dark:bg-surface border border-zinc-200 dark:border-border rounded-md px-3 py-1.5 focus-within:border-brand/50 transition-all">
              <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-500 mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder="Search streams, games, or people"
                className="bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-500 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
            <ThemeToggle />

            {/* User Auth or Actions */}
            <Fragment>
              {user && isDesktop && (
                <div className="flex items-center gap-2">
                  <button className="relative p-2 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-all">
                    <Bell className="h-5 w-5" />
                  </button>
                  <UserDropdown user={user} />
                </div>
              )}
              {!user && isDesktop && (
                <div className="flex items-center gap-3">
                  <Link
                    href="/sign-in"
                    className="text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-brand dark:hover:text-white transition-colors px-3 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    href="/sign-up"
                    className="inline-flex h-10 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-6 bg-brand hover:bg-brand-hover text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </Fragment>

            {/* Mobile Menu Button - shows hamburger OR avatar */}
            {!isDesktop && (
              <button
                type="button"
                className="cursor-pointer p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white ml-2 flex items-center"
                onClick={() => setMobileMenuOpen(true)}
              >
                {user ? (
                  <div className="h-8 w-8 rounded-full bg-linear-to-br from-[#FF5C00] to-orange-400 flex items-center justify-center text-white text-sm font-bold">
                    {user.avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user.name || "User"}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      (user.name?.[0] || user.email[0]).toUpperCase()
                    )}
                  </div>
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar */}
      {!isDesktop && (
        <MobileSidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
