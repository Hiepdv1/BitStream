"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GiftTier } from "../../types/gift";
import type { GiftFilterState } from "../../types/gift";

interface GiftFiltersProps {
  filters: GiftFilterState;
  onFiltersChange: (filters: GiftFilterState) => void;
}

export const GiftFilters = memo(function GiftFilters({
  filters,
  onFiltersChange,
}: GiftFiltersProps) {
  const [localFilters, setLocalFilters] = useState<GiftFilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalFilters((prev) => ({ ...prev, search: e.target.value }));
    },
    [],
  );

  const handleTierChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLocalFilters((prev) => ({
        ...prev,
        tier: e.target.value as GiftFilterState["tier"],
      }));
    },
    [],
  );

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLocalFilters((prev) => ({
        ...prev,
        status: e.target.value as GiftFilterState["status"],
      }));
    },
    [],
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLocalFilters((prev) => ({
        ...prev,
        sort: e.target.value as GiftFilterState["sort"],
      }));
    },
    [],
  );

  const handleApply = useCallback(() => {
    onFiltersChange(localFilters);
  }, [localFilters, onFiltersChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleApply();
      }
    },
    [handleApply],
  );

  return (
    <div className="admin-gift-filters flex flex-col xl:flex-row xl:items-center gap-3 w-full">
      <div className="admin-gift-search relative w-full xl:flex-1">
        <Search className="admin-gift-search-icon" />
        <input
          type="text"
          placeholder="Filter by gift name or ID..."
          value={localFilters.search}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="admin-gift-search-input w-full"
          id="gift-search-input"
        />
      </div>

      <div className="admin-gift-filter-group grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full xl:w-auto">
        <select
          value={localFilters.tier}
          onChange={handleTierChange}
          className="admin-gift-select w-full sm:w-auto"
          id="gift-tier-filter"
        >
          <option value="ALL">Tier: All</option>
          {Object.values(GiftTier).map((tier) => (
            <option key={tier} value={tier}>
              Tier: {tier.charAt(0) + tier.slice(1).toLowerCase()}
            </option>
          ))}
        </select>

        <select
          value={localFilters.status}
          onChange={handleStatusChange}
          className="admin-gift-select w-full sm:w-auto"
          id="gift-status-filter"
        >
          <option value="ALL">Status: All</option>
          <option value="ACTIVE">Status: Active</option>
          <option value="INACTIVE">Status: Inactive</option>
        </select>

        <select
          value={localFilters.sort}
          onChange={handleSortChange}
          className="admin-gift-select w-full sm:w-auto col-span-2"
          id="gift-sort-filter"
        >
          <option value="NEWEST">Sort: Newest</option>
          <option value="OLDEST">Sort: Oldest</option>
          <option value="PRICE_HIGH">Sort: Price High</option>
          <option value="PRICE_LOW">Sort: Price Low</option>
        </select>

        <Button
          size="sm"
          variant="primary"
          onClick={handleApply}
          className="col-span-2 sm:w-auto min-h-[42px] px-6"
        >
          Search
        </Button>
      </div>
    </div>
  );
});
