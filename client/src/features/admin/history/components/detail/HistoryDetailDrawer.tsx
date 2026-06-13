"use client";

import { memo, useMemo } from "react";
import { Copy, Clock, Layers, Activity, FileText } from "lucide-react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { toast } from "sonner";
import { JsonViewer } from "@textea/json-viewer";
import type { HistoryRecord } from "../../types/history";
import { HistoryAction, HistoryStatus } from "../../types/history";

interface HistoryDetailDrawerProps {
  record: HistoryRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusColor = (status: HistoryStatus) => {
  switch (status) {
    case HistoryStatus.SUCCESS:
      return "text-green-500";
    case HistoryStatus.FAILED:
      return "text-red-500";
    case HistoryStatus.PENDING:
      return "text-yellow-500";
    default:
      return "text-zinc-500";
  }
};

const getActionColor = (action: HistoryAction) => {
  switch (action) {
    case HistoryAction.CREATE:
      return "text-blue-500";
    case HistoryAction.UPDATE:
      return "text-brand";
    case HistoryAction.RESTORE:
      return "text-green-500";
    case HistoryAction.DELETE:
      return "text-red-500";
    default:
      return "text-zinc-500";
  }
};

export const HistoryDetailDrawer = memo(function HistoryDetailDrawer({
  record,
  isOpen,
  onClose,
}: HistoryDetailDrawerProps) {
  if (!record) return null;

  const parsedData = useMemo(() => {
    if (!record.data) return {};
    try {
      return typeof record.data === "string"
        ? JSON.parse(record.data)
        : record.data;
    } catch (e) {
      return { error: "Invalid JSON format" };
    }
  }, [record.data]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2));
    toast.success("Copied to clipboard", {
      description: "Pretty-printed JSON payload copied.",
    });
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(record.entity_id);
    toast.success("Entity ID copied");
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Log Detail"
      subtitle={`View immutable system record details for ${record.entity_name}`}
    >
      <div className="space-y-6">
        {/* Header Block */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-lg text-text-main">
              {record.entity_name}
            </h3>
            <span
              className={`px-3 py-1 bg-surface-hover border border-border rounded-lg text-xs font-bold tracking-widest uppercase ${getStatusColor(record.status)}`}
            >
              {record.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted flex items-center gap-1.5">
                <Layers className="w-3 h-3" /> Service
              </span>
              <p className="text-sm font-medium text-text-main capitalize">
                {record.service.toLowerCase()}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> Action
              </span>
              <p
                className={`text-sm font-bold ${getActionColor(record.action)}`}
              >
                {record.action}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Timestamp
              </span>
              <p className="text-sm font-medium text-text-main">
                {new Date(record.created_at).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Entity ID
              </span>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono text-text-main truncate max-w-[120px]">
                  {record.entity_id}
                </p>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-text-muted hover:text-brand transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold tracking-widest uppercase text-text-muted">
              Payload Data
            </h4>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand hover:text-brand-hover transition-colors"
            >
              <Copy className="w-3 h-3" /> Copy JSON
            </button>
          </div>

          <div className="bg-[#0D1117] border border-white/5 rounded-xl p-2 shadow-inner overflow-hidden">
            <JsonViewer
              value={parsedData}
              theme="dark"
              rootName={false}
              displayDataTypes={false}
              defaultInspectDepth={1}
              style={{
                backgroundColor: "transparent",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                padding: "12px",
              }}
            />
          </div>
        </div>

        {/* Raw Metadata */}
        <div>
          <h4 className="text-sm font-bold tracking-widest uppercase text-text-muted mb-3">
            System Meta
          </h4>
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Log ID</span>
              <span className="font-mono text-text-main">{record.id}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Entity Deleted</span>
              <span
                className={`font-bold ${record.is_entity_deleted ? "text-red-500" : "text-green-500"}`}
              >
                {record.is_entity_deleted ? "TRUE" : "FALSE"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SideDrawer>
  );
});
