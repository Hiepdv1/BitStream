import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface SettingsCardProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  className?: string;
}

export const SettingsCard = ({
  icon: Icon,
  title,
  children,
  className = "",
}: SettingsCardProps) => {
  return (
    <div
      className={`bg-surface rounded-2xl flex flex-col border border-white/5 ${className}`}
    >
      <div className="px-6 pt-6 pb-5 flex items-center gap-2.5">
        <Icon className="w-5 h-5 text-brand" />
        <h2 className="text-base font-bold text-text-main">{title}</h2>
      </div>
      <div className="px-6 pb-6 flex flex-col gap-5">{children}</div>
    </div>
  );
};
