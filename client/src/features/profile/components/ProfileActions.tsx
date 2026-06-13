import { memo } from "react";
import { Pencil, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProfileActionsProps {
  onEditProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export const ProfileActions = memo(function ProfileActions({
  onEditProfile,
  onChangePassword,
  onLogout,
  isLoggingOut = false,
}: ProfileActionsProps) {
  return (
    <div className="profile-actions">
      <Button variant="outline" size="sm" fullWidth onClick={onEditProfile}>
        <Pencil className="w-4 h-4" />
        Edit Profile
      </Button>

      <Button variant="outline" size="sm" fullWidth onClick={onChangePassword}>
        <Lock className="w-4 h-4" />
        Change Password
      </Button>

      <Button
        variant="danger"
        size="sm"
        fullWidth
        onClick={onLogout}
        isLoading={isLoggingOut}
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  );
});
