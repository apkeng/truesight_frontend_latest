import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showPageInfo = true,
  className = ""
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className={`mt-10 flex flex-col items-center gap-4 ${className}`}>
      <div className="flex items-center border border-line bg-white">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-10 w-10 items-center justify-center text-ink-muted transition-colors hover:bg-navy-wash hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
        </button>

        <div className="flex items-center border-x border-line">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={page === "..."}
              className={`flex h-10 min-w-[2.5rem] items-center justify-center text-[11px] font-semibold transition-colors ${
                page === currentPage
                  ? "bg-navy text-white"
                  : page === "..."
                  ? "cursor-default text-ink-muted"
                  : "text-ink-muted hover:bg-navy-wash hover:text-navy"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-10 w-10 items-center justify-center text-ink-muted transition-colors hover:bg-navy-wash hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted sm:flex-row sm:gap-6">
        {showPageInfo && (
          <span>
            Showing {startItem}–{endItem} of {totalItems}
          </span>
        )}

        {showItemsPerPage && (
          <div className="flex items-center gap-2">
            <span>Per page</span>
            <div className="flex border border-line bg-white">
              {[6, 12, 24].map((size) => (
                <button
                  key={size}
                  onClick={() => onItemsPerPageChange(size)}
                  className={`h-8 w-9 transition-colors ${
                    itemsPerPage === size
                      ? "bg-navy text-white"
                      : "text-ink-muted hover:bg-navy-wash hover:text-navy"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
