"use client";

import React, { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { StreamTabs } from "./StreamTabs";
import { StreamCard } from "./StreamCard";
import { CreateStreamModal } from "./CreateStreamModal";
import { EditStreamModal } from "./EditStreamModal";
import { useGetListStream } from "../hooks";
import { StreamItem } from "../types";
import { useDebounce } from "@/hooks";
import { Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 8;

export const StreamManagerView = () => {
  const [activeTab, setActiveTab] = useState<
    "ALL" | "LIVE" | "ENDED" | "DRAFT"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<StreamItem | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data, isFetching, isError } = useGetListStream({
    params: {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      status: activeTab,
      search: debouncedSearch,
    },
  });

  const streams = data?.data || [];
  const totalPages = Math.ceil((data?.meta?.total || 0) / ITEMS_PER_PAGE) || 1;

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-10">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Manage Streams
              </h1>
              <p className="text-text-muted mt-2 text-sm">
                Create and manage your live content
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-80">
                <Input
                  variant="surface"
                  placeholder="Search streams..."
                  icon={<Search className="w-4 h-4" />}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <Button
                className="w-full sm:w-auto font-semibold shadow-brand/20 shadow-lg px-6"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Stream
              </Button>
            </div>
          </div>

          {/* Filters and Content */}
          <div className="space-y-6">
            <StreamTabs activeTab={activeTab} onTabChange={handleTabChange} />

            {isFetching ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-error/50 rounded-2xl bg-error/10">
                <h3 className="text-lg font-semibold text-error">
                  Failed to load streams
                </h3>
                <p className="text-sm text-text-muted mt-2 text-center">
                  Something went wrong. Please try again later.
                </p>
              </div>
            ) : streams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {streams.map((stream) => (
                  <StreamCard
                    key={stream.id}
                    stream={stream}
                    onEdit={setEditingStream}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-border/50 rounded-2xl bg-surface/10">
                <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-text-muted" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  No streams found
                </h3>
                <p className="text-sm text-text-muted mt-2 text-center max-w-sm">
                  We couldn't find any streams matching your search or selected
                  filter.
                </p>
                <Button
                  variant="ghost"
                  className="mt-6"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("ALL");
                    setCurrentPage(1);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="pt-4"
              />
            )}
          </div>
        </div>
      </div>

      {/* Create Stream Modal */}
      <CreateStreamModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Edit Stream Modal */}
      <EditStreamModal
        stream={editingStream}
        isOpen={!!editingStream}
        onClose={() => setEditingStream(null)}
      />
    </>
  );
};
