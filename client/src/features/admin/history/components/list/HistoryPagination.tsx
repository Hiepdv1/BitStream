"use client";

import { memo, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HistoryPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const HistoryPagination = memo(function HistoryPagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: HistoryPaginationProps) {
  const totalPages = useMemo(
    () => Math.ceil(totalItems / itemsPerPage),
    [totalItems, itemsPerPage],
  );

  const startItem = useMemo(
    () => (currentPage - 1) * itemsPerPage + 1,
    [currentPage, itemsPerPage],
  );

  const endItem = useMemo(
    () => Math.min(currentPage * itemsPerPage, totalItems),
    [currentPage, itemsPerPage, totalItems],
  );

  const pages = useMemo(() => {
    const arr: number[] = [];
    const maxVisible = 3;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      arr.push(i);
    }
    return arr;
  }, [currentPage, totalPages]);

  const handlePrev = useCallback(() => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  }, [currentPage, totalPages, onPageChange]);

  if (totalPages <= 1) return null;

  const btnBaseClass =
    "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand";
  const btnActive =
    "bg-brand text-white border border-brand shadow-[0_2px_10px_rgba(var(--brand),0.3)]";
  const btnInactive =
    "bg-surface border border-border text-text-main hover:bg-surface-hover hover:text-brand hover:border-brand/30 cursor-pointer";
  const btnDisabled =
    "bg-surface/50 border border-border/50 text-text-muted opacity-50 cursor-not-allowed";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
      <div className="text-sm text-text-muted">
        Showing{" "}
        <span className="font-medium text-text-main">
          {totalItems === 0 ? 0 : startItem}
        </span>
        -<span className="font-medium text-text-main">{endItem}</span> of{" "}
        <span className="font-medium text-text-main">{totalItems}</span> logs
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          className={`${btnBaseClass} ${currentPage <= 1 ? btnDisabled : btnInactive}`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`${btnBaseClass} ${page === currentPage ? btnActive : btnInactive}`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className={`${btnBaseClass} ${currentPage >= totalPages ? btnDisabled : btnInactive}`}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});
