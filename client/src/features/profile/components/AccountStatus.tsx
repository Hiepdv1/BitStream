import { memo, useMemo } from "react";
import type { AccountStatusData } from "../types/profile";

interface AccountStatusProps {
  data: AccountStatusData;
}

export const AccountStatus = memo(function AccountStatus({
  data,
}: AccountStatusProps) {
  const securityColor = useMemo(() => {
    switch (data.securityLevel) {
      case "Perfect":
        return "profile-status-perfect";
      case "Strong":
        return "profile-status-strong";
      case "Medium":
        return "text-warning";
      case "Weak":
        return "text-error";
      default:
        return "";
    }
  }, [data.securityLevel]);

  return (
    <div className="profile-status-card">
      <p className="profile-status-label">ACCOUNT STATUS</p>

      <div className="profile-status-row">
        <span className="profile-status-key">Tier</span>
        <span className="profile-status-value">{data.tier}</span>
      </div>

      <div className="profile-status-row">
        <span className="profile-status-key">Joined</span>
        <span className="profile-status-value">{data.joinedDate}</span>
      </div>

      <div className="profile-status-row">
        <span className="profile-status-key">Security Level</span>
        <span className={`profile-status-value ${securityColor}`}>
          {data.securityLevel}
        </span>
      </div>

      <div className="profile-security-bar">
        <div
          className="profile-security-fill"
          style={{ width: `${data.securityPercent}%` }}
        />
      </div>
    </div>
  );
});
