"use client";

import { memo, useMemo } from "react";
import { Gift, Package, Ban, DollarSign, TruckElectric } from "lucide-react";
import type { GiftStats } from "../../types/gift";

interface GiftStatsCardsProps {
  stats: GiftStats;
  isLoading: boolean;
}

interface StatCard {
  label: string;
  value: string;
  variant: string;
  icon: React.ReactNode;
}

export const GiftStatsCards = memo(function GiftStatsCards({
  stats,
  isLoading,
}: GiftStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="admin-gift-stats">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="admin-gift-stat-card">
            <div className="mb-3 mt-1">
              <div className="h-2.5 w-24 bg-zinc-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
            <div className="admin-gift-stat-row">
              <div className="h-8 w-28 bg-zinc-200 dark:bg-white/10 rounded-lg animate-pulse" />
              <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-white/10 animate-pulse shrink-0" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards: StatCard[] = useMemo(
    () => [
      {
        label: "Total Gifts",
        value: String(stats.totalGifts),
        variant: "total",
        icon: <Package className="w-5 h-5" />,
      },
      {
        label: "Active Gifts",
        value: String(stats.activeGifts),
        variant: "active",
        icon: <Gift className="w-5 h-5" />,
      },
      {
        label: "Inactive Gifts",
        value: String(stats.inactiveGifts),
        variant: "inactive",
        icon: <Ban className="w-5 h-5" />,
      },
      {
        label: "Total Revenue",
        value:
          stats.totalRevenue >= 1000
            ? `${(stats.totalRevenue / 1000).toFixed(0)}K`
            : String(stats.totalRevenue),
        variant: "revenue",
        icon: <DollarSign className="w-5 h-5" />,
      },
      {
        label: "Total Transactions",
        value: String(stats.totalTransactions),
        variant: "transaction",
        icon: <TruckElectric className="w-5 h-5" />,
      },
    ],
    [stats],
  );

  return (
    <div className="admin-gift-stats">
      {cards.map((card) => (
        <div
          key={card.variant}
          className={`admin-gift-stat-card admin-gift-stat-card--${card.variant}`}
        >
          <div
            className={`admin-gift-stat-label admin-gift-stat-label--${card.variant}`}
          >
            {card.label}
          </div>
          <div className="admin-gift-stat-row">
            <span className="admin-gift-stat-value">{card.value}</span>
            <div
              className={`admin-gift-stat-icon admin-gift-stat-icon--${card.variant}`}
            >
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
