"use client";

import {
  Search,
  Bell,
  User,
  Menu,
  X,
  MessageSquare,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Logo } from "@/components/brand";
import { cn } from "@/lib/utils";

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
        className="relative p-2 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] dark:hover:bg-white/[0.06] transition-all"
        aria-label="Toggle theme"
      >
        {icon}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-[#1a1528] border border-zinc-200 dark:border-white/[0.08] rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
                  ? "text-brand bg-brand/10 font-medium"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06]",
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

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Browse", href: "/browse" },
    { name: "Following", href: "/following" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        scrolled
          ? "bg-white/95 dark:bg-[#0e0b1a]/95 backdrop-blur-md border-zinc-200 dark:border-white/[0.06] shadow-sm"
          : "bg-white dark:bg-[#0e0b1a] border-zinc-100 dark:border-white/[0.04]",
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
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-white/80 tracking-tight hidden sm:block">
              BitStream
            </span>
          </Link>

          <div className="hidden lg:flex lg:gap-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors rounded-md",
                  pathname === link.href
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200",
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden sm:flex flex-1 max-w-md mx-8">
          <div className="flex items-center w-full bg-zinc-100 dark:bg-[#1a1528] border border-zinc-200 dark:border-white/[0.06] rounded-md px-3 py-1.5 focus-within:border-brand/50 transition-all">
            <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-500 mr-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Search streams, games, or people"
              className="bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 w-full"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <ThemeToggle />

          <button className="relative p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-all">
            <Bell className="h-5 w-5" />
          </button>

          <button className="relative p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-all hidden sm:flex">
            <MessageSquare className="h-5 w-5" />
          </button>

          <button className="group flex items-center p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-all outline-none ml-1">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              G
            </div>
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-14 left-0 w-full bg-white/98 dark:bg-[#0e0b1a]/98 backdrop-blur-xl border-t border-zinc-200 dark:border-white/[0.06] shadow-2xl animate-in slide-in-from-top-2">
          <div className="space-y-1 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "block rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-white/5",
                  pathname === link.href
                    ? "text-zinc-900 dark:text-white bg-zinc-100 dark:bg-white/10"
                    : "text-zinc-500 dark:text-zinc-400",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-zinc-200 dark:bg-white/5 my-2" />
            <div className="px-4 py-2">
              <input
                type="text"
                placeholder="Search streams, games, or people"
                className="w-full bg-zinc-100 dark:bg-[#1a1528] border border-zinc-200 dark:border-white/[0.06] rounded-lg px-4 py-2 text-zinc-900 dark:text-white outline-none focus:border-brand/50 transition-colors"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
