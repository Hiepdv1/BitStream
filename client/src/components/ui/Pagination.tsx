"use client";

import { memo } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const generatePagination = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

export const Pagination = memo(
  ({ currentPage, totalPages, onPageChange, className }: PaginationProps) => {
    if (totalPages <= 1) return null;

    const pages = generatePagination(currentPage, totalPages);

    return (
      <div
        className={cn("flex items-center justify-center gap-1.5", className)}
      >
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:text-text-main hover:bg-surface-hover hover:border-brand/30 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((page, idx) => {
          if (page === "...") {
            return (
              <div
                key={`ellipsis-${idx}`}
                className="w-9 h-9 flex items-center justify-center text-text-muted"
              >
                <MoreHorizontal className="w-4 h-4" />
              </div>
            );
          }

          const isCurrent = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors",
                isCurrent
                  ? "bg-brand text-white border border-brand shadow-sm shadow-brand/20"
                  : "border cursor-pointer border-border bg-surface text-text-muted hover:text-text-main hover:bg-surface-hover hover:border-brand/30",
              )}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:text-text-main hover:bg-surface-hover hover:border-brand/30 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  },
);

Pagination.displayName = "Pagination";
