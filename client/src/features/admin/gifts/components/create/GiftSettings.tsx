"use client";

import { memo } from "react";
import { Settings } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { ShakeLevel } from "../../types/gift";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { CreateGiftFormData } from "../../schema/gift";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface GiftSettingsProps {
  register: UseFormRegister<CreateGiftFormData>;
  errors: FieldErrors<CreateGiftFormData>;
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
}

export const GiftSettings = memo(function GiftSettings({
  register,
  errors,
  isActive,
  onActiveChange,
}: GiftSettingsProps) {
  return (
    <div className="admin-gift-form-section">
      <div className="admin-gift-form-section-header">
        <div className="admin-gift-form-section-icon">
          <Settings className="w-4 h-4" />
        </div>
        <h3 className="admin-gift-form-section-title">Gift Settings</h3>
      </div>

      <div className="admin-gift-form-grid">
        {/* Duration */}
        <div>
          <label className="admin-gift-form-label" htmlFor="gift-duration">
            Duration (seconds)
          </label>
          <Input
            id="gift-duration"
            type="number"
            variant="admin"
            min={1}
            max={30}
            step={0.5}
            placeholder="5"
            error={errors.duration?.message}
            {...register("duration", { valueAsNumber: true })}
          />
        </div>

        {/* Shake Level */}
        <div>
          <label className="admin-gift-form-label" htmlFor="gift-shake-level">
            Shake Level
          </label>
          <Select
            id="gift-shake-level"
            variant="admin"
            error={errors.shake_level?.message}
            {...register("shake_level")}
          >
            {Object.values(ShakeLevel).map((level) => (
              <option key={level} value={level}>
                {level.charAt(0) + level.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </div>

        {/* Is Active */}
        <div className="admin-gift-form-full">
          <ToggleSwitch
            checked={isActive}
            onChange={onActiveChange}
            label="Active on creation"
            description="When enabled, this gift will be immediately available for viewers to purchase."
            id="gift-is-active"
          />
        </div>
      </div>
    </div>
  );
});
