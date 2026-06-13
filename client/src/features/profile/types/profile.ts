export interface ProfileSidebarItem {
  id: string;
  label: string;
  icon: string;
}

export interface AccountStatusData {
  tier: string;
  joinedDate: string;
  securityLevel: "Weak" | "Medium" | "Strong" | "Perfect";
  securityPercent: number;
}

export interface ConnectedAccount {
  provider: "GOOGLE" | "DISCORD" | "CREDENTIALS";
  email: string | null;
  connected: boolean;
}

export interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export type ThemeValue = "light" | "dark" | "system";

export interface ThemeOption {
  value: ThemeValue;
  label: string;
}

export interface ProfileExtensions {
  id: string;
  accounts: {
    id: string;
    provider: "GOOGLE" | "DISCORD" | "CREDENTIALS";
    isVerified: boolean;
    providerAccountId: string;
  }[];
}

export interface ResponseUploadAvatar {
  avatarUrl: string;
  mimeType: string;
}
