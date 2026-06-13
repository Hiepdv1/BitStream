import { memo } from "react";
import { GiftTier } from "../../types/gift";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { EditGiftFormData } from "../../schema/edit-gift";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface BasicInfoCardProps {
  register: UseFormRegister<EditGiftFormData>;
  errors: FieldErrors<EditGiftFormData>;
}

export const BasicInfoCard = memo(function BasicInfoCard({
  register,
  errors,
}: BasicInfoCardProps) {
  return (
    <div className="bg-background border border-border shadow-xs rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-brand text-white font-bold text-xs shrink-0">
          i
        </div>
        <h3 className="font-heading font-bold text-lg">Basic Info</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-widest text-text-muted uppercase flex items-center gap-2">
            <span>Gift Name</span>
            <span className="text-error">*</span>
          </label>
          <Input
            type="text"
            variant="surface"
            error={errors.name?.message}
            {...register("name")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-widest text-text-muted uppercase flex items-center gap-2">
            <span>Price (Bits)</span>
            <span className="text-error">*</span>
          </label>
          <Input
            type="number"
            variant="surface"
            error={errors.price?.message}
            {...register("price", { valueAsNumber: true })}
            min="0"
            step="1"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "." || e.key === "e") {
                e.preventDefault();
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold tracking-widest text-text-muted uppercase flex items-center gap-2">
          <span>Tier Level</span>
          <span className="text-error">*</span>
        </label>
        <Select
          variant="surface"
          error={errors.tier?.message}
          {...register("tier")}
        >
          <option value={GiftTier.BASIC}>Basic</option>
          <option value={GiftTier.RARE}>Rare</option>
          <option value={GiftTier.EPIC}>Epic</option>
          <option value={GiftTier.LEGENDARY}>Premium / Legendary</option>
        </Select>
      </div>
    </div>
  );
});
