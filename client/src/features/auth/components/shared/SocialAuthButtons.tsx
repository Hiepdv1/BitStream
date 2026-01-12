"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { UI_TEXT } from "../../constants/ui";

export function SocialAuthButtons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleAuth = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/post-auth",
        redirect: true,
      });
    } catch (error) {
      console.error("Google auth error:", error);
    }
  };

  const handleDiscordAuth = async () => {
    try {
      await signIn("discord", {
        callbackUrl: "/post-auth",
        redirect: true,
      });
    } catch (error) {
      console.error("Discord auth error:", error);
    }
  };

  const isDisabled = !mounted;

  return (
    <div className="space-y-3">
      <button
        onClick={handleGoogleAuth}
        className="btn-social group"
        disabled={isDisabled}
        type="button"
      >
        <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

        <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
          />
          <path
            fill="#34A853"
            d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"
          />
          <path
            fill="#4A90E2"
            d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"
          />
          <path
            fill="#FBBC05"
            d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067 Z"
          />
        </svg>
        <span className="relative z-10">{UI_TEXT.auth.social.google}</span>
      </button>

      <button
        onClick={handleDiscordAuth}
        className="btn-social btn-social-discord group"
        disabled={isDisabled}
        type="button"
      >
        <div className="absolute inset-0 bg-discord/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

        <svg className="w-5 h-5 fill-discord relative z-10" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
        </svg>
        <span className="relative z-10">{UI_TEXT.auth.social.discord}</span>
      </button>
    </div>
  );
}
