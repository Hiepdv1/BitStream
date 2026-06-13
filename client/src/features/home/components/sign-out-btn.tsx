"use client";

import * as authApi from "@/features/auth/api/auth.api";

export function SignOutButton() {
  return (
    <div>
      <button
        onClick={() => authApi.logout()}
        className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
      >
        Sign out
      </button>
    </div>
  );
}
