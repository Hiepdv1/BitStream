"use client";

import { memo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { HistoryAction, HistoryStatus } from "../../types/history";
import type { HistoryFilterState } from "../../types/history";

interface HistoryFiltersProps {
  filters: HistoryFilterState;
  onFiltersChange: (filters: HistoryFilterState) => void;
}

export const HistoryFilters = memo(function HistoryFilters({
  filters,
  onFiltersChange,
}: HistoryFiltersProps) {
  const updateFilter = (key: keyof HistoryFilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6 p-4 sm:p-5 bg-surface border border-border shadow-xs rounded-2xl">
      {/* Search */}
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Search by entity Name or ID..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          icon={<Search className="w-4 h-4 text-text-muted" />}
          variant="admin"
        />
      </div>

      <div className="flex flex-wrap lg:flex-nowrap gap-4 shrink-0">
        {/* Service */}
        <div className="w-full sm:w-[140px] shrink-0">
          <Select
            value={filters.service}
            onChange={(e) => updateFilter("service", e.target.value)}
            variant="admin"
          >
            <option value="ALL">All Services</option>
            <option value="GIFT">Gift</option>
            <option value="USER">User</option>
            <option value="STREAM">Stream</option>
            <option value="SYSTEM">System</option>
            <option value="TRANSACTION">Transaction</option>
          </Select>
        </div>

        {/* Action */}
        <div className="w-full sm:w-[140px] shrink-0">
          <Select
            value={filters.action}
            onChange={(e) => updateFilter("action", e.target.value)}
            variant="admin"
          >
            <option value="ALL">All Actions</option>
            {Object.values(HistoryAction).map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </Select>
        </div>

        {/* Status */}
        <div className="w-full sm:w-[140px] shrink-0">
          <Select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            variant="admin"
          >
            <option value="ALL">All Status</option>
            {Object.values(HistoryStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>

        {/* Sort */}
        <div className="w-full sm:w-[140px] shrink-0">
          <Select
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            variant="admin"
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
          </Select>
        </div>
      </div>
    </div>
  );
});
