"use client";

import { memo, useCallback, useMemo } from "react";
import { Gift as GiftIcon, Pencil, Eye, Trash2 } from "lucide-react";
import { DataView, DataViewColumn } from "@/components/ui/DataView";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { Gift } from "../../types/gift";

interface GiftTableProps {
  gifts: Gift[];
  isLoading?: boolean;
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

// ── Tier badge styling ──
const TIER_BADGE_CLASS: Record<string, string> = {
  BASIC: "admin-gift-tier-badge--basic",
  RARE: "admin-gift-tier-badge--rare",
  EPIC: "admin-gift-tier-badge--epic",
  LEGENDARY: "admin-gift-tier-badge--legendary",
};

// ── Shake dot styling ──
const SHAKE_DOT_CLASS: Record<string, string> = {
  NONE: "admin-gift-shake-dot--none",
  LOW: "admin-gift-shake-dot--low",
  MEDIUM: "admin-gift-shake-dot--medium",
  HIGH: "admin-gift-shake-dot--high",
};

function formatShakeLabel(level: string) {
  return level.charAt(0) + level.slice(1).toLowerCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function shortId(id: string) {
  return `ID: BSG-${id.slice(-4).toUpperCase()}`;
}

export const GiftTable = memo(function GiftTable({
  gifts,
  isLoading,
  onToggleActive,
  onEdit,
  onView,
  onDelete,
}: GiftTableProps) {
  const handleToggleActive = useCallback(
    (id: string, active: boolean) => {
      onToggleActive(id, active);
    },
    [onToggleActive],
  );

  const handleEdit = useCallback(
    (id: string) => {
      onEdit(id);
    },
    [onEdit],
  );

  const handleView = useCallback(
    (id: string) => {
      onView(id);
    },
    [onView],
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDelete(id);
    },
    [onDelete],
  );

  const columns: DataViewColumn<Gift>[] = useMemo(
    () => [
      {
        key: "preview",
        header: "Gift Preview",
        cardFullWidth: true,
        render: (gift) => (
          <div className="admin-gift-preview-cell">
            <img
              src={`${process.env.NEXT_PUBLIC_ASSET_URL}/assets/gift/images/${gift.image_url}`}
              alt={gift.name}
              className="admin-gift-preview-thumb"
              loading="lazy"
            />
            <div className="min-w-0">
              <div className="admin-gift-preview-name truncate">
                {gift.name}
              </div>
              <div className="admin-gift-preview-id truncate">
                {shortId(gift.id)}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "tier",
        header: "Tier",
        render: (gift) => (
          <span
            className={`admin-gift-tier-badge ${TIER_BADGE_CLASS[gift.tier] || ""}`}
          >
            {gift.tier}
          </span>
        ),
      },
      {
        key: "price",
        header: "Price",
        render: (gift) => (
          <div className="admin-gift-price">
            <span className="admin-gift-price-coin">₿</span>
            <span>{gift.price.toLocaleString()}</span>
          </div>
        ),
      },
      {
        key: "duration",
        header: "Duration",
        hideOnCard: true,
        render: (gift) => (
          <span className="admin-gift-duration">
            {gift.duration.toFixed(1)}s
          </span>
        ),
      },
      {
        key: "shake",
        header: "Shake Level",
        hideOnCard: true,
        render: (gift) => (
          <div className="admin-gift-shake">
            <span
              className={`admin-gift-shake-dot ${SHAKE_DOT_CLASS[gift.shake_level] || ""}`}
            />
            <span>{formatShakeLabel(gift.shake_level)}</span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (gift) => (
          <ToggleSwitch
            checked={gift.is_active}
            onChange={(checked) => handleToggleActive(gift.id, checked)}
            id={`gift-toggle-${gift.id}`}
          />
        ),
      },
      {
        key: "created",
        header: "Created",
        hideOnCard: true,
        render: (gift) => (
          <span className="admin-gift-date">{formatDate(gift.createdAt)}</span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (gift) => (
          <div className="admin-gift-actions">
            <button
              type="button"
              className="admin-gift-action-btn"
              onClick={() => handleEdit(gift.id)}
              aria-label={`Edit ${gift.name}`}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="admin-gift-action-btn"
              onClick={() => handleView(gift.id)}
              aria-label={`View ${gift.name}`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="admin-gift-action-btn text-error hover:bg-error/10"
              onClick={() => handleDelete(gift.id)}
              aria-label={`Delete ${gift.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [handleToggleActive, handleEdit, handleView, handleDelete],
  );

  const keyExtractor = useCallback((gift: Gift) => gift.id, []);

  return (
    <DataView
      data={gifts}
      isLoading={isLoading}
      columns={columns}
      keyExtractor={keyExtractor}
      emptyIcon={<GiftIcon className="w-8 h-8" />}
      emptyTitle="No gifts found"
      emptyDescription="Try adjusting your filters or create a new gift."
    />
  );
});
