import { Fragment, memo, useCallback } from "react";
import type { ConnectedAccount } from "../types/profile";
import { Button } from "@/components/ui/Button";
import { ChevronRight, Lock } from "lucide-react";

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  GOOGLE: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  ),
  DISCORD: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#5865F2">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  ),
  CREDENTIALS: (
    <svg
      className="w-5 h-5 text-gray-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3-3.5 3.5z" />
    </svg>
  ),
};

interface ConnectedAccountsProps {
  accounts: ConnectedAccount[];
  onConnect: (provider: string) => void;
  onDisconnect: (provider: string) => void;
}

export const ConnectedAccounts = memo(function ConnectedAccounts({
  accounts,
  onConnect,
  onDisconnect,
}: ConnectedAccountsProps) {
  const handleAction = useCallback(
    (provider: string, connected: boolean) => {
      if (connected) {
        onDisconnect(provider);
      } else {
        onConnect(provider);
      }
    },
    [onConnect, onDisconnect],
  );

  return (
    <div className="profile-card">
      <h3 className="profile-card-title" style={{ marginBottom: "8px" }}>
        Connected Accounts
      </h3>

      {accounts.map((account) => (
        <div key={account.provider} className="profile-account-row">
          <div className="profile-account-info">
            <div className="profile-account-icon">
              {PROVIDER_ICONS[account.provider]}
            </div>
            <div>
              <p className="profile-account-name">{account.provider}</p>
              <p className="profile-account-email">
                {account.connected
                  ? `Connected as ${account.email}`
                  : "Not connected"}
              </p>
            </div>
          </div>

          {account.provider === "CREDENTIALS" ? (
            <Fragment>
              {!account.connected && (
                <button
                  onClick={() =>
                    handleAction(account.provider, account.connected)
                  }
                  className={`profile-account-action profile-account-connect`}
                >
                  Connect
                </button>
              )}
            </Fragment>
          ) : (
            <button
              onClick={() => handleAction(account.provider, account.connected)}
              className={`profile-account-action ${
                account.connected
                  ? "profile-account-disconnect"
                  : "profile-account-connect"
              }`}
            >
              {account.connected ? "Disconnect" : "Connect"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
});
