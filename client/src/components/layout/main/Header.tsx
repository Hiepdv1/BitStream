"use client";

import { Search, Bell, User, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/brand";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <nav className="mx-auto flex w-full items-center justify-between p-4 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="group">
            <Logo className="w-8 h-8" />
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-400 hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-8">
          <Link
            href="/"
            className="text-sm font-semibold text-white hover:text-purple-400 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/browse"
            className="text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/my-list"
            className="text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors"
          >
            My List
          </Link>
          <Link
            href="/categories"
            className="text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors"
          >
            Categories
          </Link>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <button className="rounded-full p-2 text-gray-300 hover:bg-white/10 hover:text-white transition-all">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </button>

          <button className="rounded-full p-2 text-gray-300 hover:bg-white/10 hover:text-white transition-all relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-purple-500"></span>
            <span className="sr-only">Notifications</span>
          </button>

          <button className="flex items-center gap-2 rounded-full bg-linear-to-r from-purple-600 to-orange-500 p-0.5 hover:from-purple-500 hover:to-orange-400 transition-all">
            <div className="rounded-full bg-black px-3 py-1.5 flex items-center gap-2">
              <User className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Profile</span>
            </div>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-black/95 backdrop-blur-md">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/browse"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-300 hover:bg-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse
            </Link>
            <Link
              href="/my-list"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-300 hover:bg-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              My List
            </Link>
            <Link
              href="/categories"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-300 hover:bg-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>

            <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
              <button className="flex-1 rounded-lg bg-purple-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-purple-500">
                Profile
              </button>
              <button className="rounded-lg p-2 text-gray-300 hover:bg-white/10">
                <Search className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-2 text-gray-300 hover:bg-white/10 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-purple-500"></span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
