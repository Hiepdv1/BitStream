import { memo } from "react";
import { Shield, Info, Lock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PasswordSecurityProps {
  isOAuth?: boolean;
  onCreatePassword?: () => void;
  onChangePassword?: () => void;
}

export const PasswordSecurity = memo(function PasswordSecurity({
  isOAuth = true,
  onCreatePassword,
  onChangePassword,
}: PasswordSecurityProps) {
  return (
    <div className="profile-card">
      <div className="profile-card-header">
        <div className="profile-card-icon">
          <Shield className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h3 className="profile-card-title text-text-main">
            Password & Security
          </h3>
          <p className="profile-card-subtitle text-text-muted">
            Manage how you access your account
          </p>
        </div>
      </div>

      {isOAuth ? (
        <div className="profile-security-info">
          <div className="profile-security-info-icon">
            <Info className="w-4 h-4" />
          </div>
          <div className="profile-security-info-text">
            <p className="profile-security-info-title">
              You signed in with a social account
            </p>
            <p className="profile-security-info-desc">
              You can create a password to secure your account further or to
              enable direct login if you want to disconnect your social account
              later.
            </p>
            <button
              className="profile-security-link"
              onClick={onCreatePassword}
            >
              Create A Password
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 mt-2 transition-all border cursor-pointer bg-surface hover:bg-surface-hover rounded-xl border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand/10">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-main">Password</p>
              <p className="text-xs font-medium text-text-muted">
                ••••••••••••••••
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={onChangePassword}>
            <span>Change</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
});
