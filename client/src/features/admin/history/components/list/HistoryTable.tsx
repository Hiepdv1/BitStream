"use client";

import { memo, useCallback, useMemo } from "react";
import { Eye, Clock, RotateCcw, Undo2, Trash2 } from "lucide-react";
import { DataView, DataViewColumn } from "@/components/ui/DataView";
import type { HistoryRecord } from "../../types/history";
import { HistoryAction, HistoryStatus } from "../../types/history";

interface HistoryTableProps {
  histories: HistoryRecord[];
  isLoading?: boolean;
  onView: (id: string) => void;
  onRecover: (id: string, service: string) => void;
  onRollback: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  // return d.toLocaleDateString("en-US", {
  //   month: "short",
  //   day: "numeric",
  //   year: "numeric",
  //   hour: "2-digit",
  //   minute: "2-digit",
  // });
  return d.toLocaleString();
}

function shortId(id: string) {
  return `ID: ...${id.slice(-6).toUpperCase()}`;
}

const getStatusStyles = (status: HistoryStatus) => {
  switch (status) {
    case HistoryStatus.SUCCESS:
      return "bg-green-500/10 text-green-500 border border-green-500/20";
    case HistoryStatus.FAILED:
      return "bg-red-500/10 text-red-500 border border-red-500/20";
    case HistoryStatus.PENDING:
      return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20";
  }
};

const getActionStyles = (action: HistoryAction) => {
  switch (action) {
    case HistoryAction.CREATE:
      return "text-blue-500 bg-blue-500/10";
    case HistoryAction.UPDATE:
      return "text-brand bg-brand/10";
    case HistoryAction.RESTORE:
      return "text-green-500 bg-green-500/10";
    case HistoryAction.DELETE:
      return "text-red-500 bg-red-500/10";
    default:
      return "text-zinc-500 bg-zinc-500/10";
  }
};

export const HistoryTable = memo(function HistoryTable({
  histories,
  isLoading,
  onView,
  onRecover,
  onRollback,
  onDelete,
}: HistoryTableProps) {
  const handleView = useCallback(
    (id: string) => {
      onView(id);
    },
    [onView],
  );

  const handleRecover = useCallback(
    (id: string, service: string) => {
      onRecover(id, service);
    },
    [onRecover],
  );

  const handleRollback = useCallback(
    (id: string) => {
      onRollback(id);
    },
    [onRollback],
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDelete(id);
    },
    [onDelete],
  );

  const columns: DataViewColumn<HistoryRecord>[] = useMemo(
    () => [
      {
        key: "entity",
        header: "Entity Log",
        cardFullWidth: true,
        render: (record) => (
          <div className="flex items-center justify-center gap-3">
            <div
              className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold tracking-widest text-[10px] ${getActionStyles(record.action)}`}
            >
              {record.service.slice(0, 3)}
            </div>
            <div className="min-w-0">
              <div className="font-heading font-bold text-text-main text-sm truncate max-w-[200px] sm:max-w-[300px]">
                {record.entity_name}
              </div>
              <div className="text-[10px] sm:text-xs text-text-muted mt-0.5 truncate tracking-wide font-mono">
                {shortId(record.entity_id)}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "action",
        header: "Action",
        render: (record) => (
          <span
            className={`block px-2 py-1 rounded-md text-center text-[10px] font-bold tracking-widest uppercase ${getActionStyles(record.action)}`}
          >
            {record.action}
          </span>
        ),
      },
      {
        key: "service",
        header: "Service",
        hideOnCard: true,
        render: (record) => (
          <span className="block text-center text-sm font-medium text-text-main capitalize">
            {record.service.toLowerCase()}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (record) => (
          <div className="flex justify-center items-center">
            <span
              className={`px-2.5 py-1 rounded-lg text-center text-[10px] font-bold tracking-widest uppercase flex justify-center items-center w-fit ${getStatusStyles(record.status)}`}
            >
              {record.status}
            </span>
          </div>
        ),
      },
      {
        key: "created",
        header: "Timestamp",
        hideOnCard: true,
        render: (record) => (
          <span className="block text-center text-xs text-text-muted font-medium whitespace-nowrap">
            {formatDate(record.created_at)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Details",
        render: (record) => (
          <div className="flex justify-center gap-1 pr-2">
            {record.action === HistoryAction.DELETE && (
              <button
                type="button"
                className="cursor-pointer w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-green-500 hover:bg-green-500/10 transition-colors"
                onClick={() => handleRecover(record.id, record.service)}
                aria-label={`Recover log ${record.id}`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            {record.action === HistoryAction.UPDATE && (
              <button
                type="button"
                className="cursor-pointer w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-brand hover:bg-brand/10 transition-colors"
                onClick={() => handleRollback(record.id)}
                aria-label={`Rollback log ${record.id}`}
              >
                <Undo2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              className="cursor-pointer w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-brand hover:bg-brand/10 transition-colors"
              onClick={() => handleView(record.id)}
              aria-label={`View log ${record.id}`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="cursor-pointer w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
              onClick={() => handleDelete(record.id)}
              aria-label={`Delete log ${record.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [handleView, handleRecover, handleRollback, handleDelete],
  );

  const keyExtractor = useCallback((record: HistoryRecord) => record.id, []);

  return (
    <DataView
      data={histories}
      isLoading={isLoading}
      columns={columns}
      keyExtractor={keyExtractor}
      emptyIcon={<Clock className="w-8 h-8" />}
      emptyTitle="No history records found"
      emptyDescription="Try adjusting your filters or wait for system events to occur."
    />
  );
});
