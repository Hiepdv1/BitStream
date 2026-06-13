"use client";

import React from "react";
import { cn } from "@/lib/utils";

type TabValue = "ALL" | "LIVE" | "ENDED" | "DRAFT";

interface StreamTabsProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}

const TABS: { label: string; value: TabValue }[] = [
  { label: "All", value: "ALL" },
  { label: "Live", value: "LIVE" },
  { label: "Ended", value: "ENDED" },
  { label: "Draft", value: "DRAFT" },
];

export const StreamTabs = ({ activeTab, onTabChange }: StreamTabsProps) => {
  return (
    <div className="flex items-center gap-2 border-b border-border/50 pb-4">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              isActive
                ? "bg-brand text-white"
                : "cursor-pointer text-text-muted hover:text-text-main hover:bg-surface/50",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
