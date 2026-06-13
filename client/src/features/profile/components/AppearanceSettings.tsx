import { memo, useCallback } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import type { ThemeOption, ThemeValue } from "../types/profile";

const THEME_OPTIONS: ThemeOption[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const THEME_ICONS: Record<ThemeValue, React.ReactNode> = {
  light: <Sun className="w-6 h-6" />,
  dark: <Moon className="w-6 h-6" />,
  system: <Monitor className="w-6 h-6" />,
};

const THEME_ICON_BG: Record<ThemeValue, string> = {
  light: "bg-white/10",
  dark: "bg-zinc-400 dark:bg-zinc-800",
  system: "bg-white/10",
};

interface AppearanceSettingsProps {
  currentTheme: ThemeValue;
  onThemeChange: (theme: ThemeValue) => void;
}

export const AppearanceSettings = memo(function AppearanceSettings({
  currentTheme,
  onThemeChange,
}: AppearanceSettingsProps) {
  const handleSelect = useCallback(
    (value: ThemeValue) => {
      onThemeChange(value);
    },
    [onThemeChange],
  );

  return (
    <div className="profile-card">
      <h3 className="profile-card-title" style={{ marginBottom: "16px" }}>
        Appearance
      </h3>

      <div className="profile-theme-grid">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`profile-theme-card ${
              currentTheme === option.value
                ? "profile-theme-card-active"
                : "profile-theme-card-inactive"
            }`}
          >
            <div
              className={`profile-theme-icon ${THEME_ICON_BG[option.value]}`}
            >
              {THEME_ICONS[option.value]}
            </div>
            <span className="profile-theme-label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
