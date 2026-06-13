"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { HistoryStatsCards } from "./HistoryStatsCards";
import { HistoryFilters } from "./HistoryFilters";
import { HistoryTable } from "./HistoryTable";
import { HistoryPagination } from "./HistoryPagination";
import type {
  HistoryRecord,
  HistoryFilterState,
  HistoryStats,
} from "../../types/history";
import {
  useHistories,
  useHistoryStats,
  useRestoreHistory,
  useRollbackHistory,
  useDeleteHistory,
} from "../../hooks";
import { PaginationMeta } from "@/lib/http/normalize/types";
import { HistoryDetailDrawer } from "../detail/HistoryDetailDrawer";
import { toast } from "sonner";
import { useConfirmStore } from "@/hooks/useConfirm";
import { useAppQueryClient } from "@/hooks";

const ITEMS_PER_PAGE = 12;

export const HistoryListPage = () => {
  const [histories, setHistories] = useState<HistoryRecord[]>([]);
  const [filters, setFilters] = useState<HistoryFilterState>({
    search: "",
    service: "ALL",
    action: "ALL",
    status: "ALL",
    sort: "NEWEST",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [historyStats, setHistoryStats] = useState<HistoryStats | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const { refreshGiftDashboard, refreshHistoryDashboard } = useAppQueryClient();

  const { data: historiesData, isLoading: isLoadingHistories } = useHistories({
    params: {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      ...filters,
    },
  });

  const { data: statsData, isLoading: isLoadingStats } = useHistoryStats();

  const confirm = useConfirmStore((s) => s.confirm);
  const { mutateAsync: restoreRecord } = useRestoreHistory();
  const { mutateAsync: rollbackRecord } = useRollbackHistory();
  const { mutateAsync: deleteRecord } = useDeleteHistory();

  useEffect(() => {
    if (statsData) setHistoryStats(statsData);
  }, [statsData]);

  useEffect(() => {
    if (historiesData?.data) {
      setHistories(historiesData.data);
    }
    if (historiesData?.meta) {
      setMeta({
        limit: historiesData.meta.limit,
        page: historiesData.meta.page,
        total: historiesData.meta.total,
      });
    }
  }, [historiesData]);

  const stats: HistoryStats = useMemo(
    () => ({
      totalHistories: historyStats?.totalHistories || 0,
      totalPending: historyStats?.totalPending || 0,
      totalFailed: historyStats?.totalFailed || 0,
      totalDeleted: historyStats?.totalDeleted || 0,
    }),
    [historyStats],
  );

  const handleFiltersChange = useCallback((newFilters: HistoryFilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleView = useCallback((id: string) => {
    setSelectedRecordId(id);
  }, []);

  const handleRecover = useCallback(
    async (id: string, service: string) => {
      const recordToRecover = histories.find((h) => h.id === id);
      if (!recordToRecover) return;

      await confirm({
        title: "Restore Record?",
        description: (
          <div className="flex flex-col gap-2">
            <p className="text-[12px] font-medium text-slate-700">
              {`You are about to restore the history record for "${
                recordToRecover.entity_name
              }". This will trigger a RESTORE operation. Please type the record ID to confirm.`}
            </p>
            <div className="bg-slate-950 p-3 rounded-md border border-slate-800 shadow-inner">
              <code className="text-sm font-mono text-emerald-400 font-bold break-all select-all">
                {id}
              </code>
            </div>
          </div>
        ),
        variant: "danger",
        confirmText: "Restore Record",
        requireInput: id,
        reason: {
          isOpen: true,
          isRequired: true,
          label: "Reason for Restore",
          placeholder: "Why are you restoring this record?",
        },
        onConfirm: async (reasonValue) => {
          await restoreRecord(
            { id, reason: reasonValue },
            {
              onSuccess: () => {
                if (service === "GIFT") refreshGiftDashboard();

                refreshHistoryDashboard();
              },
              onError: (error) => {
                toast.error(error.message || "Failed to restore record");
              },
            },
          );
        },
      });
    },
    [
      confirm,
      histories,
      restoreRecord,
      refreshGiftDashboard,
      refreshHistoryDashboard,
    ],
  );

  const handleRollback = useCallback(
    async (id: string) => {
      const recordToRollback = histories.find((h) => h.id === id);
      if (!recordToRollback) return;

      await confirm({
        title: "Rollback Update?",
        description: (
          <div className="flex flex-col gap-2">
            <p className="text-[12px] font-medium text-slate-700">
              {`You are about to rollback the update for "${
                recordToRollback.entity_name
              }". This will revert the entity to its previous state. Please type the record ID to confirm.`}
            </p>
            <div className="bg-slate-950 p-3 rounded-md border border-slate-800 shadow-inner">
              <code className="text-sm font-mono text-blue-400 font-bold break-all select-all">
                {id}
              </code>
            </div>
          </div>
        ),
        variant: "danger",
        confirmText: "Rollback Update",
        requireInput: id,
        reason: {
          isOpen: true,
          isRequired: true,
          label: "Reason for Rollback",
          placeholder: "Why are you rolling back this update?",
        },
        onConfirm: async (reasonValue) => {
          await rollbackRecord(
            { id, reason: reasonValue },
            {
              onSuccess: () => {
                if (recordToRollback.service === "GIFT") refreshGiftDashboard();
                refreshHistoryDashboard();
                toast.success("Record rolled back successfully");
              },
              onError: (error) => {
                toast.error(error.message || "Failed to rollback record");
              },
            },
          );
        },
      });
    },
    [
      confirm,
      histories,
      rollbackRecord,
      refreshGiftDashboard,
      refreshHistoryDashboard,
    ],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const recordToDelete = histories.find((h) => h.id === id);
      if (!recordToDelete) return;

      await confirm({
        title: "Delete History Log?",
        description: (
          <div className="flex flex-col gap-2">
            <p className="text-[12px] font-medium text-slate-700">
              {`You are about to PERMANENTLY delete the history log for "${
                recordToDelete.entity_name
              }". This will NOT delete the actual entity, only this audit log. Please type the log ID to confirm.`}
            </p>
            <div className="bg-slate-950 p-3 rounded-md border border-slate-800 shadow-inner">
              <code className="text-sm font-mono text-red-500 font-bold break-all select-all">
                {id}
              </code>
            </div>
          </div>
        ),
        variant: "danger",
        confirmText: "Delete Log",
        requireInput: id,
        reason: {
          isOpen: true,
          isRequired: true,
          label: "Reason for Deletion",
          placeholder: "Why are you permanently deleting this log?",
        },
        onConfirm: async (reasonValue) => {
          await deleteRecord(
            { id, reason: reasonValue },
            {
              onSuccess: () => {
                refreshHistoryDashboard();
                toast.success("History log deleted successfully");
              },
              onError: (error) => {
                toast.error(error.message || "Failed to delete history log");
              },
            },
          );
        },
      });
    },
    [confirm, histories, deleteRecord, refreshHistoryDashboard],
  );

  const selectedRecord = useMemo(
    () => histories.find((h) => h.id === selectedRecordId) || null,
    [histories, selectedRecordId],
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-main tracking-tight">
            System History Logs
          </h1>
          <p className="mt-2 text-sm text-text-muted max-w-2xl leading-relaxed">
            Immutable audit trail of system operations. Monitor changes out of
            critical entities like user profiles, stream sessions, and virtual
            gifts.
          </p>
        </div>
      </div>

      <HistoryStatsCards isLoading={isLoadingStats} stats={stats} />

      <HistoryFilters filters={filters} onFiltersChange={handleFiltersChange} />

      <HistoryTable
        histories={histories}
        isLoading={isLoadingHistories}
        onView={handleView}
        onRecover={handleRecover}
        onRollback={handleRollback}
        onDelete={handleDelete}
      />

      <HistoryPagination
        currentPage={currentPage}
        totalItems={meta?.total || 0}
        itemsPerPage={meta?.limit || ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
      />

      <HistoryDetailDrawer
        record={selectedRecord}
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecordId(null)}
      />
    </div>
  );
};
