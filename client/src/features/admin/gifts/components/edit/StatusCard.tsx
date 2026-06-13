import { memo } from "react";
import { Eye } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { Button } from "@/components/ui/Button";

interface StatusCardProps {
  isActive: boolean;
  onActiveChange: (v: boolean) => void;
}

export const StatusCard = memo(function StatusCard({
  isActive,
  onActiveChange,
}: StatusCardProps) {
  return (
    <div className="bg-background border border-border shadow-xs rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-brand" />
          <h3 className="font-heading font-bold text-lg">Status</h3>
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${
            isActive
              ? "bg-brand/10 text-brand"
              : "bg-text-muted/10 text-text-muted"
          }`}
        >
          {isActive ? "ACTIVE" : "INACTIVE"}
        </span>
      </div>

      <p className="text-xs text-text-muted leading-relaxed mb-4">
        Deactivating this gift will hide it from the store but keep existing
        inventory for users.
      </p>

      <div className="flex gap-2">
        <Button
          variant={isActive ? "primary" : "secondary"}
          className="flex-1"
          size="sm"
          onClick={() => onActiveChange(true)}
        >
          Active
        </Button>
        <Button
          variant={!isActive ? "primary" : "secondary"}
          className="flex-1"
          size="sm"
          onClick={() => onActiveChange(false)}
        >
          Inactive
        </Button>
      </div>
    </div>
  );
});
