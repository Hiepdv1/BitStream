"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useProfile } from "@/features/auth/hooks/useProfile";
import useLogout from "@/features/auth/hooks/useLogout";
import { clearAuthExpiries } from "@/lib/auth/tokenUtils";
import { useAppQueryClient } from "@/hooks";
import { useConfirmStore } from "@/hooks/useConfirm";
import type {
  AccountStatusData,
  ConnectedAccount,
  NotificationSetting,
  ThemeValue,
} from "@/features/profile/types/profile";

import {
  ProfileSidebar,
  ProfileCover,
  AccountStatus,
  PersonalInfo,
  PasswordSecurity,
  ConnectedAccounts,
  NotificationSettings,
  CreatePasswordModal,
  ChangePasswordModal,
  ChangeAvatarModal,
  AppearanceSettings,
} from "@/features/profile/components";
import useProfileExtensions from "@/features/profile/hook/useProfileExtensions";
import { useUnlinkAccount } from "@/features/profile/hook/useUnlinkAccount";
import { toast } from "sonner";
import { UserRole } from "@/enums";

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    key: "email",
    label: "Email Notifications",
    description: "Receive weekly summaries and post",
    enabled: true,
  },
  {
    key: "stream-alerts",
    label: "Stream Alerts",
    description: "Get notified when followed channels go live",
    enabled: true,
  },
  {
    key: "new-followers",
    label: "New Followers",
    description: "Activity alerts for your profile growth",
    enabled: false,
  },
  {
    key: "marketing",
    label: "Marketing Emails",
    description: "Updates on features and new promotions",
    enabled: false,
  },
];

const ProfilePage = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const {
    data: user,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
  } = useProfile();
  const { confirm } = useConfirmStore();
  const {
    data: extensions,
    isLoading: isLoadingExtensions,
    isFetching: isFetchingExtensions,
  } = useProfileExtensions();
  const logout = useLogout();
  const { clearAll } = useAppQueryClient();

  const { mutate: unlinkAccount } = useUnlinkAccount();

  // ── Sidebar ──
  const [activeSection, setActiveSection] = useState("overview");

  // ── Modals ──
  const [isCreatePasswordOpen, setIsCreatePasswordOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeAvatarOpen, setIsChangeAvatarOpen] = useState(false);

  // ── Account Status ──
  const accountStatus: AccountStatusData = useMemo(() => {
    const connectedCount = extensions?.accounts?.length || 0;

    let securityLevel: AccountStatusData["securityLevel"] = "Weak";
    let securityPercent = 15;

    if (connectedCount === 1) {
      securityLevel = "Medium";
      securityPercent = 45;
    } else if (connectedCount === 2) {
      securityLevel = "Strong";
      securityPercent = 80;
    } else if (connectedCount >= 3) {
      securityLevel = "Perfect";
      securityPercent = 100;
    }

    return {
      tier: UserRole[user?.role || 1] || "",
      joinedDate: user
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "—",
      securityLevel,
      securityPercent,
    };
  }, [user, extensions]);

  // ── Connected Accounts ──
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([
    { provider: "GOOGLE", email: null, connected: false },
    { provider: "DISCORD", email: null, connected: false },
    { provider: "CREDENTIALS", email: null, connected: false },
  ]);

  // Sync connected accounts based on user data
  useMemo(() => {
    if (extensions) {
      setConnectedAccounts((prev) => {
        const newAccounts = prev.map((account) => {
          const extension = extensions.accounts.find(
            (ext) => ext.provider === account.provider,
          );

          if (!extension) {
            return account;
          }

          return {
            ...account,
            email: extension.providerAccountId,
            connected: true,
          };
        });

        return newAccounts;
      });
    }
  }, [extensions]);

  // ── Notifications ──
  const [notifications, setNotifications] = useState<NotificationSetting[]>(
    NOTIFICATION_SETTINGS,
  );

  // ── Scroll Spy ──
  useEffect(() => {
    if (isLoadingUser || isLoadingExtensions) return;

    const sectionIds = [
      "overview",
      "security",
      "linked-accounts",
      "appearance",
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("section-", "");
            setActiveSection(id);
          }
        });
      },
      { rootMargin: "-60px 0px -80% 0px", threshold: 0 },
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(`section-${id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isLoadingUser, isLoadingExtensions]);

  // ── Callbacks ──
  const handleSectionChange = useCallback((id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleLogout = useCallback(() => {
    logout.mutate(null, {
      onSuccess: () => {
        clearAuthExpiries();
        clearAll();
        router.push("/sign-in");
      },
    });
  }, [logout, clearAll, router]);

  const handleAvatarClick = useCallback(() => {
    setIsChangeAvatarOpen(true);
  }, []);

  const handleChangePassword = useCallback(() => {
    setIsChangePasswordOpen(true);
  }, []);

  const handleConnectAccount = useCallback((provider: string) => {
    if (provider === "CREDENTIALS") {
      setIsCreatePasswordOpen(true);
      return;
    }

    signIn(provider.toLowerCase(), {
      callbackUrl: "/profile",
      redirect: true,
    });
  }, []);

  const handleDisconnectAccount = useCallback(
    async (provider: string) => {
      const isConfirmed = await confirm({
        title: "Disconnect Account",
        description: `Are you sure you want to disconnect your ${provider} account? You may lose access to features that depend on this connection.`,
        variant: "warning",
        confirmText: "Disconnect",
        cancelText: "Cancel",
      });

      if (!isConfirmed) return;

      unlinkAccount(provider, {
        onSuccess: () => {
          setConnectedAccounts((prev) =>
            prev.map((acc) =>
              acc.provider === provider ? { ...acc, connected: false } : acc,
            ),
          );
          toast.success("Account disconnected successfully");
        },
        onError: (err) => {
          toast.error(err.message || "Failed to disconnect account");
        },
      });
    },
    [confirm, unlinkAccount],
  );

  const handleNotificationToggle = useCallback(
    (key: string, enabled: boolean) => {
      setNotifications((prev) =>
        prev.map((n) => (n.key === key ? { ...n, enabled } : n)),
      );
    },
    [],
  );

  const handleThemeChange = useCallback(
    (value: ThemeValue) => {
      setTheme(value);
    },
    [setTheme],
  );

  const handleSaveChanges = useCallback(() => {
    // TODO: Implement save changes API call
    console.log("Saving changes...");
  }, []);

  const handleCreatePassword = useCallback(() => {
    setIsCreatePasswordOpen(true);
  }, []);

  // ── Render ──
  if (isLoadingUser || isLoadingExtensions) {
    return (
      <div className="profile-page">
        <div className="flex items-center justify-center flex-1 py-20">
          <div className="text-text-muted">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="flex items-center justify-center flex-1 py-20">
          <div className="text-text-muted">Loading profile...</div>
        </div>
      </div>
    );
  }

  const isOAuth = connectedAccounts.every(
    (account) => !(account.provider === "CREDENTIALS" && account.connected),
  );

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <ProfileSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Mobile Tabs */}
      <div className="profile-content">
        <div className="profile-mobile-tabs scrollbar-none">
          {["overview", "security", "linked-accounts", "appearance"].map(
            (id) => (
              <button
                key={id}
                onClick={() => handleSectionChange(id)}
                className={`profile-mobile-tab ${
                  activeSection === id
                    ? "profile-mobile-tab-active"
                    : "profile-mobile-tab-inactive"
                }`}
              >
                {id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ),
          )}
        </div>

        <div id="section-overview" className="scroll-mt-24">
          {/* Cover */}
          <ProfileCover
            name={user.name}
            email={user.email}
            avatarUrl={user.avatarUrl}
            onAvatarClick={handleAvatarClick}
          />

          {/* Top Grid: Status + Actions | Personal Info */}
          <div className="profile-content-grid ">
            <div className="flex flex-col gap-4">
              <AccountStatus data={accountStatus} />
            </div>

            <PersonalInfo
              initialDisplayName={user.name || ""}
              initialBio={user.bio || ""}
              email={user.email || ""}
            />
          </div>
        </div>

        {/* Password & Security */}
        <div id="section-security" className="scroll-mt-24">
          <PasswordSecurity
            isOAuth={isOAuth}
            onCreatePassword={handleCreatePassword}
            onChangePassword={handleChangePassword}
          />
        </div>

        {/* Connected Accounts */}
        <div id="section-linked-accounts" className="scroll-mt-24">
          <ConnectedAccounts
            accounts={connectedAccounts}
            onConnect={handleConnectAccount}
            onDisconnect={handleDisconnectAccount}
          />
        </div>

        {/* Notifications */}
        <NotificationSettings
          settings={notifications}
          onToggle={handleNotificationToggle}
        />

        {/* Appearance */}
        <div id="section-appearance" className="scroll-mt-24">
          <AppearanceSettings
            currentTheme={(theme as ThemeValue) || "dark"}
            onThemeChange={handleThemeChange}
          />
        </div>
      </div>

      {/* Modals */}
      <CreatePasswordModal
        isOpen={isCreatePasswordOpen}
        connectedAccounts={setConnectedAccounts}
        onClose={() => setIsCreatePasswordOpen(false)}
      />
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
      <ChangeAvatarModal
        isOpen={isChangeAvatarOpen}
        onClose={() => setIsChangeAvatarOpen(false)}
        currentAvatarUrl={user.avatarUrl}
        userName={user.name}
      />
    </div>
  );
};

export default ProfilePage;
