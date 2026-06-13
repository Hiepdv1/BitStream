import { memo } from "react";
import { Users, Eye, Clapperboard, TrendingUp } from "lucide-react";

interface StudioStatsProps {
  followers?: number;
  subscribers?: number;
  totalViews?: number;
  totalStreams?: number;
}

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}

const StatItem = memo(({ icon, label, value, accent }: StatItemProps) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-brand/30 transition-colors group">
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent ?? "bg-brand/10 text-brand"}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-xl font-extrabold text-text-main tracking-tight leading-none">
        {value}
      </p>
      <p className="text-xs text-text-muted mt-0.5 font-medium uppercase tracking-wider">
        {label}
      </p>
    </div>
  </div>
));
StatItem.displayName = "StatItem";

export const StudioStats = memo(
  ({
    followers = 0,
    subscribers = 0,
    totalViews = 0,
    totalStreams = 0,
  }: StudioStatsProps) => {
    const stats = [
      {
        icon: <Users className="w-5 h-5" />,
        label: "Followers",
        value: formatNumber(followers),
        accent: "bg-brand/10 text-brand",
      },
      {
        icon: <TrendingUp className="w-5 h-5" />,
        label: "Subscribers",
        value: formatNumber(subscribers),
        accent: "bg-orange-500/10 text-orange-500",
      },
      {
        icon: <Eye className="w-5 h-5" />,
        label: "Total Views",
        value: formatNumber(totalViews),
        accent: "bg-emerald-500/10 text-emerald-500",
      },
      {
        icon: <Clapperboard className="w-5 h-5" />,
        label: "Streams",
        value: formatNumber(totalStreams),
        accent: "bg-sky-500/10 text-sky-500",
      },
    ];

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {stats.map((s) => (
          <StatItem key={s.label} {...s} />
        ))}
      </div>
    );
  },
);

StudioStats.displayName = "StudioStats";
