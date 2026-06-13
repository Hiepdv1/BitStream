"use client";

import { memo } from "react";
import { Copyleft, PlusCircle, Trash, AlertOctagon } from "lucide-react";
import type { HistoryStats } from "../../types/history";

interface HistoryStatsCardsProps {
  stats: HistoryStats;
  isLoading: boolean;
}

export const HistoryStatsCards = memo(function HistoryStatsCards({
  stats,
  isLoading,
}: HistoryStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-surface border border-border p-5 rounded-2xl"
          >
            <div className="mb-3 mt-1">
              <div className="h-2.5 w-24 bg-zinc-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
            <div className="flex justify-between items-end">
              <div className="h-8 w-16 bg-zinc-200 dark:bg-white/10 rounded-lg animate-pulse" />
              <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-white/10 animate-pulse shrink-0" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Logs",
      value: String(stats.totalHistories),
      icon: <Copyleft className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Pending Actions",
      value: String(stats.totalPending),
      icon: <PlusCircle className="w-5 h-5 text-yellow-500" />,
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    {
      label: "Failed Actions",
      value: String(stats.totalFailed),
      icon: <AlertOctagon className="w-5 h-5 text-red-500" />,
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    {
      label: "Deleted Entities",
      value: String(stats.totalDeleted),
      icon: <Trash className="w-5 h-5 text-zinc-500" />,
      bg: "bg-zinc-500/10",
      border: "border-zinc-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`relative p-5 rounded-2xl border ${card.border} bg-surface overflow-hidden`}
        >
          <div className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-text-muted mb-2">
            {card.label}
          </div>
          <div className="flex justify-between items-end">
            <span className="text-2xl sm:text-3xl font-black font-heading text-text-main tracking-tight">
              {card.value}
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}
            >
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
