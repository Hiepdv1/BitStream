import { memo, useCallback } from "react";
import { User, CreditCard, Shield, Link2, Palette, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ProfileSidebarItem } from "../types/profile";

const SIDEBAR_ITEMS: ProfileSidebarItem[] = [
  { id: "overview", label: "Account Overview", icon: "user" },
  { id: "security", label: "Security", icon: "shield" },
  { id: "linked-accounts", label: "Linked Accounts", icon: "link" },
  { id: "appearance", label: "Appearance", icon: "palette" },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  user: <User className="w-4 h-4" />,
  "credit-card": <CreditCard className="w-4 h-4" />,
  shield: <Shield className="w-4 h-4" />,
  link: <Link2 className="w-4 h-4" />,
  palette: <Palette className="w-4 h-4" />,
};

interface ProfileSidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export const ProfileSidebar = memo(function ProfileSidebar({
  activeSection,
  onSectionChange,
}: ProfileSidebarProps) {
  const handleClick = useCallback(
    (id: string) => {
      onSectionChange(id);
    },
    [onSectionChange],
  );

  return (
    <aside className="profile-sidebar">
      <div className="profile-sidebar-header">
        <h2 className="profile-sidebar-title">SETTINGS</h2>
        <p className="profile-sidebar-subtitle">Manage your experience</p>
      </div>

      <nav className="profile-sidebar-nav">
        {SIDEBAR_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`profile-sidebar-item ${
              activeSection === item.id ? "profile-sidebar-item-active" : ""
            }`}
          >
            {ICON_MAP[item.icon]}
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
});
