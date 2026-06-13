import { memo } from "react";
import { HelpCircle, Monitor } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { GiftTier } from "../../types/gift";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

interface DisplayModesCardProps {
  chatMode: boolean;
  streamMode: boolean;
  tier: GiftTier;
  onChatModeChange: (v: boolean) => void;
  onStreamModeChange: (v: boolean) => void;
}

export const DisplayModesCard = memo(function DisplayModesCard({
  chatMode,
  streamMode,
  tier,
  onChatModeChange,
  onStreamModeChange,
}: DisplayModesCardProps) {
  return (
    <div className="bg-background border border-border shadow-xs rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Monitor className="w-5 h-5 text-brand" />
        <h3 className="font-heading font-bold text-lg">Display Modes</h3>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text-main">
            Enable Chat Mode
          </span>
          <ToggleSwitch
            checked={chatMode}
            onChange={onChatModeChange}
            id="editChatMode"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-main">
              Enable Stream Mode
            </span>
            {tier === GiftTier.BASIC && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-warning cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Basic tier gifts do not support Stream Mode.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <ToggleSwitch
            checked={streamMode}
            onChange={onStreamModeChange}
            id="editStreamMode"
            disabled={tier === GiftTier.BASIC}
          />
        </div>
      </div>
    </div>
  );
});
