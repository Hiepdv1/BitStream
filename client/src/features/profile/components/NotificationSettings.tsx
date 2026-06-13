import { memo, useCallback } from "react";
import { Bell } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { NotificationSetting } from "../types/profile";

interface NotificationSettingsProps {
  settings: NotificationSetting[];
  onToggle: (key: string, enabled: boolean) => void;
}

export const NotificationSettings = memo(function NotificationSettings({
  settings,
  onToggle,
}: NotificationSettingsProps) {
  const handleToggle = useCallback(
    (key: string) => (checked: boolean) => {
      onToggle(key, checked);
    },
    [onToggle],
  );

  return (
    <div className="profile-card">
      <div className="profile-card-header">
        <div className="profile-card-icon">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h3 className="profile-card-title">Notifications</h3>
        </div>
      </div>

      <div className="profile-notification-list">
        {settings.map((setting) => (
          <div key={setting.key} className="profile-notification-item">
            <ToggleSwitch
              id={`notification-${setting.key}`}
              checked={setting.enabled}
              onChange={handleToggle(setting.key)}
              label={setting.label}
              description={setting.description}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
