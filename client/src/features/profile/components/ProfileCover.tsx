import { memo } from "react";
import { Camera } from "lucide-react";

interface ProfileCoverProps {
  name: string | null;
  email: string;
  avatarUrl: string | null;
  isOnline?: boolean;
  onAvatarClick?: () => void;
}

export const ProfileCover = memo(function ProfileCover({
  name,
  email,
  avatarUrl,
  isOnline = true,
  onAvatarClick,
}: ProfileCoverProps) {
  const displayName = name || "User";
  const initials = (name?.[0] || email[0]).toUpperCase();

  const avatar = `${process.env.NEXT_PUBLIC_ASSET_URL}/assets/avatar/${avatarUrl}`;

  return (
    <div className="profile-cover">
      <div className="profile-cover-avatar">
        <div
          className="profile-cover-avatar-wrapper group"
          onClick={onAvatarClick}
          title="Change avatar"
        >
          {avatarUrl ? (
            <img
              src={avatar}
              alt={displayName}
              className="profile-cover-avatar-img"
            />
          ) : (
            <div className="profile-cover-avatar-fallback">{initials}</div>
          )}

          {onAvatarClick && (
            <div className="profile-cover-avatar-overlay group-hover:opacity-100">
              <Camera className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <div className="profile-cover-info">
          <h1 className="profile-cover-name">
            {displayName}
            {isOnline && (
              <span className="profile-cover-badge">
                <span className="profile-cover-badge-dot" />
                online now
              </span>
            )}
          </h1>
          <span className="profile-cover-email">{email}</span>
        </div>
      </div>
    </div>
  );
});
