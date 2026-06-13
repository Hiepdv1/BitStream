"use client";

import { memo, useCallback, useMemo } from "react";
import { Pencil, Eye } from "lucide-react";
import type { Gift, GiftTier, ShakeLevel } from "../../types/gift";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

interface GiftTableRowProps {
  gift: Gift;
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

const TIER_BADGE_CLASS: Record<GiftTier, string> = {
  BASIC: "admin-gift-tier-badge--basic",
  RARE: "admin-gift-tier-badge--rare",
  EPIC: "admin-gift-tier-badge--epic",
  LEGENDARY: "admin-gift-tier-badge--legendary",
};

const SHAKE_DOT_CLASS: Record<ShakeLevel, string> = {
  NONE: "admin-gift-shake-dot--none",
  LOW: "admin-gift-shake-dot--low",
  MEDIUM: "admin-gift-shake-dot--medium",
  HIGH: "admin-gift-shake-dot--high",
};

export const GiftTableRow = memo(function GiftTableRow({
  gift,
  onToggleActive,
  onEdit,
  onView,
}: GiftTableRowProps) {
  const handleToggle = useCallback(
    (checked: boolean) => {
      onToggleActive(gift.id, checked);
    },
    [gift.id, onToggleActive],
  );

  const handleEdit = useCallback(() => {
    onEdit(gift.id);
  }, [gift.id, onEdit]);

  const handleView = useCallback(() => {
    onView(gift.id);
  }, [gift.id, onView]);

  const formattedDate = useMemo(() => {
    return new Date(gift.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [gift.createdAt]);

  const shortId = useMemo(() => {
    return `ID: BSG-${gift.id.slice(-4).toUpperCase()}`;
  }, [gift.id]);

  const shakeLabel = useMemo(() => {
    return gift.shake_level.charAt(0) + gift.shake_level.slice(1).toLowerCase();
  }, [gift.shake_level]);

  return (
    <tr>
      {/* Gift Preview */}
      <td>
        <div className="admin-gift-preview-cell">
          <img
            src={gift.image_url}
            alt={gift.name}
            className="admin-gift-preview-thumb"
            loading="lazy"
          />
          <div className="w-16">
            <div className="admin-gift-preview-name">{gift.name}</div>
            <div className="admin-gift-preview-id">{shortId}</div>
          </div>
        </div>
      </td>

      {/* Tier Badge */}
      <td>
        <span
          className={`admin-gift-tier-badge ${TIER_BADGE_CLASS[gift.tier] || ""}`}
        >
          {gift.tier}
        </span>
      </td>

      {/* Price */}
      <td>
        <div className="admin-gift-price">
          <span className="admin-gift-price-coin">₿</span>
          <span>{gift.price.toLocaleString()}</span>
        </div>
      </td>

      {/* Duration */}
      <td>
        <span className="admin-gift-duration">{gift.duration.toFixed(1)}s</span>
      </td>

      {/* Shake Level */}
      <td>
        <div className="admin-gift-shake">
          <span
            className={`admin-gift-shake-dot ${SHAKE_DOT_CLASS[gift.shake_level] || ""}`}
          />
          <span>{shakeLabel}</span>
        </div>
      </td>

      {/* Status Toggle */}
      <td>
        <ToggleSwitch
          checked={gift.is_active}
          onChange={handleToggle}
          id={`gift-toggle-${gift.id}`}
        />
      </td>

      {/* Created Date */}
      <td>
        <span className="admin-gift-date">{formattedDate}</span>
      </td>

      {/* Actions */}
      <td>
        <div className="admin-gift-actions">
          <button
            type="button"
            className="admin-gift-action-btn"
            onClick={handleEdit}
            aria-label={`Edit ${gift.name}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="admin-gift-action-btn"
            onClick={handleView}
            aria-label={`View ${gift.name}`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});
