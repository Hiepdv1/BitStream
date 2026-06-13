"use client";

import { useEffect, useState } from "react";
import {
  Palette,
  Sparkles,
  Bell,
  Database,
  Zap,
  Terminal,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { SettingsCard } from "./SettingsCard";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useProfile } from "@/features/auth/hooks";
import { UserRole } from "@/enums";

export const SettingsPageContent = () => {
  // Mock State
  const { theme: themeMode, setTheme: setThemeMode } = useTheme();
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [autoPlayPreviews, setAutoPlayPreviews] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [enableNotifications, setEnableNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(false);

  const { data: profile } = useProfile();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <div className="max-w-[760px] mx-auto w-full py-12 px-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-heading font-bold text-text-main tracking-wide mb-2">
          Settings
        </h1>
        <p className="text-sm text-text-muted">
          Manage your account preferences and application experience.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Appearance */}
        <SettingsCard icon={Palette} title="Appearance">
          <div className="bg-black/40 border border-white/5 rounded-xl p-1.5 flex items-center justify-between">
            <button
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg transition-all ${
                themeMode === "light"
                  ? "bg-brand text-zinc-200 shadow-lg"
                  : "text-text-muted hover:text-text-main hover:bg-white/5"
              }`}
              onClick={() => setThemeMode("light")}
            >
              <Sun className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                LIGHT
              </span>
            </button>
            <button
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg transition-all ${
                themeMode === "dark"
                  ? "bg-brand text-zinc-200 shadow-lg"
                  : "text-text-muted hover:text-text-main hover:bg-white/5"
              }`}
              onClick={() => setThemeMode("dark")}
            >
              <Moon className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                DARK
              </span>
            </button>
            <button
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg transition-all ${
                themeMode === "system"
                  ? "bg-brand text-zinc-200 shadow-lg"
                  : "text-text-muted hover:text-text-main hover:bg-white/5"
              }`}
              onClick={() => setThemeMode("system")}
            >
              <Monitor className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                SYSTEM
              </span>
            </button>
          </div>
        </SettingsCard>

        {/* Experience */}
        <SettingsCard icon={Sparkles} title="Experience">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-text-main mb-1">
                  Enable animations
                </p>
                <p className="text-xs text-text-muted">
                  Smooth transitions throughout the interface.
                </p>
              </div>
              <ToggleSwitch
                id="enableAnimations"
                checked={enableAnimations}
                onChange={setEnableAnimations}
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-text-main mb-1">
                  Reduce motion
                </p>
                <p className="text-xs text-text-muted">
                  Minimize background movement and effects.
                </p>
              </div>
              <ToggleSwitch
                id="reduceMotion"
                checked={reduceMotion}
                onChange={setReduceMotion}
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-text-main mb-1">
                  Auto-play previews
                </p>
                <p className="text-xs text-text-muted">
                  Automatically play trailers when hovering.
                </p>
              </div>
              <ToggleSwitch
                id="autoPlay"
                checked={autoPlayPreviews}
                onChange={setAutoPlayPreviews}
              />
            </div>
          </div>
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard icon={Bell} title="Notifications">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold text-text-main">
                Enable notifications
              </p>
              <ToggleSwitch
                id="enableNotif"
                checked={enableNotifications}
                onChange={setEnableNotifications}
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold text-text-main">Sound</p>
              <ToggleSwitch
                id="soundNotif"
                checked={sound}
                onChange={setSound}
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold text-text-main">
                Desktop notifications
              </p>
              <ToggleSwitch
                id="desktopNotif"
                checked={desktopNotifications}
                onChange={setDesktopNotifications}
              />
            </div>
          </div>
        </SettingsCard>

        {/* Local Data */}
        <SettingsCard icon={Database} title="Local Data">
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="md"
              className="border-white/10 hover:bg-white/5 text-text-main text-xs font-medium"
            >
              Clear cache
            </Button>
            <Button
              variant="outline"
              size="md"
              className="border-white/10 hover:bg-white/5 text-text-main text-xs font-medium"
            >
              Reset settings
            </Button>
          </div>
        </SettingsCard>

        {/* Quick Actions */}
        <SettingsCard icon={Zap} title="Quick Actions">
          <div className="flex flex-col gap-2">
            <button className="flex justify-between items-center bg-black/20 hover:bg-white/5 px-4 py-3.5 rounded-xl border border-white/5 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <RotateCcw className="w-4 h-4 text-text-muted group-hover:text-text-main transition-colors" />
                <span className="text-sm font-medium text-text-main">
                  Reset password
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-main transition-colors" />
            </button>
            <button className="flex justify-between items-center bg-error/5 hover:bg-error/10 px-4 py-3.5 rounded-xl border border-error/10 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-error" />
                <span className="text-sm font-medium text-error">Logout</span>
              </div>
            </button>
          </div>
        </SettingsCard>

        {/* System */}
        {profile && (profile.role & UserRole.ADMIN) !== 0 && (
          <SettingsCard icon={Terminal} title="System">
            <Link
              href="/admin/settings/history"
              className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors cursor-pointer text-xs font-bold tracking-widest uppercase self-start"
            >
              System Admin History
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </SettingsCard>
        )}
      </div>
    </div>
  );
};
