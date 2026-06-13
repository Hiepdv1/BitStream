"use client";

import { memo } from "react";
import { Info } from "lucide-react";
import { GiftTier } from "../../types/gift";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { CreateGiftFormData } from "../../schema/gift";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface GiftBasicInfoProps {
  register: UseFormRegister<CreateGiftFormData>;
  errors: FieldErrors<CreateGiftFormData>;
}

export const GiftBasicInfo = memo(function GiftBasicInfo({
  register,
  errors,
}: GiftBasicInfoProps) {
  return (
    <div className="admin-gift-form-section">
      <div className="admin-gift-form-section-header">
        <div className="admin-gift-form-section-icon">
          <Info className="w-4 h-4" />
        </div>
        <h3 className="admin-gift-form-section-title">Basic Information</h3>
      </div>

      <div className="admin-gift-form-grid">
        {/* Gift Name */}
        <div className="admin-gift-form-full">
          <label className="admin-gift-form-label" htmlFor="gift-name">
            Gift Name
          </label>
          <Input
            id="gift-name"
            type="text"
            variant="admin"
            placeholder="Enter gift name..."
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        {/* Coin Price */}
        <div>
          <label className="admin-gift-form-label" htmlFor="gift-price">
            Coin Price
          </label>
          <div className="admin-gift-form-input-with-icon">
            <div className="admin-gift-form-input-icon z-10">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#fff",
                }}
              >
                ₿
              </span>
            </div>
            <Input
              id="gift-price"
              type="number"
              variant="admin"
              min={1}
              placeholder="50"
              style={{ paddingLeft: "2.5rem" }}
              error={errors.price?.message}
              {...register("price", { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Tier Level */}
        <div>
          <label className="admin-gift-form-label" htmlFor="gift-tier">
            Tier Level
          </label>
          <Select
            id="gift-tier"
            variant="admin"
            error={errors.tier?.message}
            {...register("tier")}
          >
            {Object.values(GiftTier).map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
});
