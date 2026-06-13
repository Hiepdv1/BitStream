import { memo } from "react";
import { FileText } from "lucide-react";

interface MetadataCardProps {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export const MetadataCard = memo(function MetadataCard({
  id,
  createdAt,
  updatedAt,
}: MetadataCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-background border border-border shadow-xs rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-brand" />
        <h3 className="font-heading font-bold text-lg">Metadata</h3>
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-xs font-bold tracking-widest uppercase">
            System ID
          </span>
          <span className="font-mono text-xs text-text-main">
            BIT-GFT-{id.substring(0, 5).toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-xs font-bold tracking-widest uppercase">
            Created
          </span>
          <span className="text-xs font-medium text-text-main">
            {formatDate(createdAt)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-xs font-bold tracking-widest uppercase">
            Last Updated
          </span>
          <span className="text-xs font-medium text-text-main">
            {formatDate(updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
});
