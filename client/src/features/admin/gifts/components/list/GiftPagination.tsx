"use client";

import { memo, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GiftPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const GiftPagination = memo(function GiftPagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: GiftPaginationProps) {
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

  return (
    <div className="admin-gift-pagination">
      <div className="admin-gift-pagination-info">
        Showing {startItem}-{endItem} of {totalItems} gifts
      </div>

      <div className="admin-gift-pagination-buttons">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          className={`admin-gift-pagination-btn ${currentPage <= 1 ? "admin-gift-pagination-btn--disabled" : "admin-gift-pagination-btn--inactive"}`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`admin-gift-pagination-btn ${page === currentPage ? "admin-gift-pagination-btn--active" : "admin-gift-pagination-btn--inactive"}`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className={`admin-gift-pagination-btn ${currentPage >= totalPages ? "admin-gift-pagination-btn--disabled" : "admin-gift-pagination-btn--inactive"}`}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});
