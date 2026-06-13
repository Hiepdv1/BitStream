"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GiftStatsCards } from "./GiftStatsCards";
import { GiftFilters } from "./GiftFilters";
import { GiftTable } from "./GiftTable";
import { GiftPagination } from "./GiftPagination";
import type { Gift, GiftFilterState, GiftStats } from "../../types/gift";
import { useGifts } from "../../hooks/useGifts";
import { useConfirmStore } from "@/hooks/useConfirm";
import { PaginationMeta } from "@/lib/http/normalize/types";
import { GiftDetailDrawer } from "../detail/GiftDetailDrawer";
import { useGiftStats } from "../../hooks/useGiftStats";
import { useGiftActive } from "../../hooks/useGiftActive";
import { toast } from "sonner";
import { useAppQueryClient } from "@/hooks";
import { useUpdateGiftSettings } from "../../hooks/useUpdateGiftSettings";
import { useDeleteGift } from "../../hooks/useDeleteGift";

const ITEMS_PER_PAGE = 12;

export const GiftListPage = () => {
  const router = useRouter();

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [filters, setFilters] = useState<GiftFilterState>({
    search: "",
    tier: "ALL",
    status: "ALL",
    shakeLevel: "ALL",
    sort: "NEWEST",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [giftStats, setGiftStats] = useState<GiftStats | null>(null);
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const queryClient = useAppQueryClient();

  const { confirm } = useConfirmStore();

  const { mutateAsync: updateGiftSettings } = useUpdateGiftSettings();

  const { mutateAsync: deleteGiftAsync } = useDeleteGift();

  const { mutateAsync: giftActiveMutation, isPending: isLoadingGiftActive } =
    useGiftActive();

  const { data: giftsData, isLoading: isLoadingGifts } = useGifts({
    params: {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      ...filters,
    },
  });

  const { data: giftStatsData, isLoading: isLoadingGiftStats } = useGiftStats();

  useEffect(() => {
    if (giftStatsData) {
      setGiftStats(giftStatsData);
    }
  }, [giftStatsData]);

  useEffect(() => {
    if (giftsData?.data) {
      setGifts(giftsData.data);
    }
    if (giftsData?.meta) {
      setMeta({
        limit: giftsData.meta.limit,
        page: giftsData.meta.page,
        total: giftsData.meta.total,
      });
    }
  }, [giftsData]);

  const stats: GiftStats = useMemo(
    () => ({
      totalGifts: giftStats?.totalGifts || 0,
      activeGifts: giftStats?.activeGifts || 0,
      totalRevenue: giftStats?.totalRevenue || 0,
      inactiveGifts: giftStats?.inactiveGifts || 0,
      totalTransactions: giftStats?.totalTransactions || 0,
    }),
    [giftStats],
  );

  const handleFiltersChange = useCallback((newFilters: GiftFilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleUpdateGiftSettings = useCallback(
    async (
      id: string,
      is_chat_mode: boolean | null,
      is_stream_mode: boolean | null,
    ) => {
      const isTurningOff = is_chat_mode === false || is_stream_mode === false;

      const executeUpdate = async () => {
        await updateGiftSettings(
          {
            giftID: id,
            is_chat_mode: is_chat_mode || false,
            is_stream_mode: is_stream_mode || false,
          },
          {
            onSuccess: () => {
              setGifts((prev) =>
                prev.map((g) =>
                  g.id === id
                    ? {
                        ...g,
                        is_chatMode: is_chat_mode ?? false,
                        is_streamMode: is_stream_mode ?? false,
                        updatedAt: new Date().toISOString(),
                      }
                    : g,
                ),
              );
            },
          },
        );
      };

      if (isTurningOff) {
        const isChatModeOff = is_chat_mode === false;
        const isStreamModeOff = is_stream_mode === false;

        await confirm({
          title: "Update Gift Settings",
          description: `Are you sure you want to deactivate ${isChatModeOff ? "chat mode" : ""} ${isStreamModeOff ? "stream mode" : ""} ?`,
          variant: "warning",
          cancelText: "Cancel",
          onConfirm: executeUpdate,
        });
      } else {
        await executeUpdate();
      }
    },
    [confirm, updateGiftSettings],
  );

  const handleToggleActive = useCallback(
    async (id: string, active: boolean) => {
      const performMutation = async () => {
        await giftActiveMutation(
          { id, is_active: active },
          {
            onSuccess: ({ id, ...rest }) => {
              queryClient.refreshGiftDashboard();

              setGifts((prev) =>
                prev.map((g) => (g.id === id ? { ...g, ...rest } : g)),
              );

              setGiftStats((prev) => {
                if (!prev) return prev;
                const diff = active ? 1 : -1;
                return {
                  ...prev,
                  activeGifts: prev.activeGifts + diff,
                  inactiveGifts: prev.inactiveGifts - diff,
                };
              });
              toast.success(
                `Gift ${active ? "activated" : "deactivated"} successfully`,
              );
            },
            onError: (err) => toast.error(err.message),
          },
        );
      };

      if (!active) {
        await confirm({
          title: "Deactivate Gift?",
          description:
            "Deactivating this gift will immediately revoke access. This might cause user dissatisfaction.",
          variant: "warning",
          confirmText: "Disable",
          onConfirm: performMutation,
        });
      } else {
        await performMutation();
      }
    },
    [confirm, giftActiveMutation],
  );

  const handleEdit = useCallback(
    (id: string) => {
      // TODO: Navigate to edit page
      router.push(`/admin/gifts/edit/${id}`);
    },
    [router],
  );

  const handleView = useCallback((id: string) => {
    setSelectedGiftId(id);
  }, []);

  const selectedGift = useMemo(
    () => gifts.find((g) => g.id === selectedGiftId) || null,
    [gifts, selectedGiftId],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const giftToDel = gifts.find((g) => g.id === id);
      if (!giftToDel) return;

      await confirm({
        title: "Delete Gift?",
        description: (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-500 leading-relaxed">
              This action is{" "}
              <span className="text-red-600 font-semibold underline">
                permanent
              </span>
              . The gift <strong>"{giftToDel.name}"</strong> will be removed
              from the system and archived.
            </p>

            <div className="flex flex-col gap-2">
              <p className="text-[12px] font-medium text-slate-700">
                Enter the ID below to confirm:
              </p>
              <div className="bg-slate-950 p-3 rounded-md border border-slate-800 shadow-inner">
                <code className="text-sm font-mono text-emerald-400 font-bold break-all select-all">
                  {id}
                </code>
              </div>
            </div>
          </div>
        ),
        variant: "danger",
        confirmText: "Confirm Deletion",
        requireInput: id,
        onConfirm: async () => {
          await deleteGiftAsync(id, {
            onSuccess: () => {
              queryClient.refreshGiftDashboard();
              queryClient.refreshHistoryDashboard();
              toast.success("Gift deleted successfully");
            },
            onError: (err) => toast.error(err.message),
          });
        },
      });
    },
    [confirm, gifts, selectedGiftId, queryClient],
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleCreateGift = useCallback(() => {
    router.push("/admin/gifts/create");
  }, [router]);

  return (
    <div className="admin-gift-page">
      <div className="admin-gift-header">
        <div className="admin-gift-header-text">
          <h1>Gift Management</h1>
          <p>
            Configure, monitor, and deploy interactive virtual gifts for the
            BitStream live ecosystem. Manage tiers, pricing, and visual impact
            levels.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleCreateGift}
          className="w-full sm:w-auto sm:h-10 sm:px-5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Gift
        </Button>
      </div>

      <GiftStatsCards
        isLoading={isLoadingGiftStats || isLoadingGiftActive}
        stats={stats}
      />

      <GiftFilters filters={filters} onFiltersChange={handleFiltersChange} />

      <GiftTable
        gifts={gifts}
        isLoading={isLoadingGifts}
        onToggleActive={handleToggleActive}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      <GiftPagination
        currentPage={currentPage}
        totalItems={meta?.total || 0}
        itemsPerPage={meta?.limit || ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
      />

      <GiftDetailDrawer
        gift={selectedGift}
        isOpen={!!selectedGift}
        onClose={() => setSelectedGiftId(null)}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
        handleUpdateGiftSettings={handleUpdateGiftSettings}
      />
    </div>
  );
};
