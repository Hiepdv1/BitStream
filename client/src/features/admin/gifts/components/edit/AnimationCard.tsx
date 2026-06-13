import { memo } from "react";
import { Play } from "lucide-react";
import { ShakeLevel } from "../../types/gift";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { EditGiftFormData } from "../../schema/edit-gift";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface AnimationCardProps {
  register: UseFormRegister<EditGiftFormData>;
  errors: FieldErrors<EditGiftFormData>;
}

export const AnimationCard = memo(function AnimationCard({
  register,
  errors,
}: AnimationCardProps) {
  return (
    <div className="bg-background border border-border shadow-xs rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Play className="w-5 h-5 text-brand fill-brand" />
        <h3 className="font-heading font-bold text-lg">Animation</h3>
      </div>

      <div className="space-y-5">
        {/* Duration - INPUT field as user requested */}
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-widest text-text-muted uppercase flex items-center gap-2">
            <span>Duration (S)</span>
            <span className="text-error">*</span>
          </label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              variant="surface"
              min={1}
              max={20}
              error={errors.duration?.message}
              {...register("duration", { valueAsNumber: true })}
            />
            <span className="text-xs text-text-muted font-bold whitespace-nowrap">
              s
            </span>
          </div>
          {!errors.duration && (
            <p className="text-[11px] text-text-muted mt-1">
              Enter animation duration in seconds (e.g. 4.5s)
            </p>
          )}
        </div>

        {/* Shake Level */}
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-widest text-text-muted uppercase flex items-center gap-2">
            <span>Shake Intensity</span>
            <span className="text-error">*</span>
          </label>
          <Select
            variant="surface"
            error={errors.shake_level?.message}
            {...register("shake_level")}
          >
            <option value={ShakeLevel.NONE}>None</option>
            <option value={ShakeLevel.LOW}>Low Impulse</option>
            <option value={ShakeLevel.MEDIUM}>Medium Impulse</option>
            <option value={ShakeLevel.HIGH}>High Impulse</option>
          </Select>
        </div>
      </div>
    </div>
  );
});
