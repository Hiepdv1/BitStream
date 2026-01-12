"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <div>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
      >
        Sign out
      </button>
    </div>
  );
}
