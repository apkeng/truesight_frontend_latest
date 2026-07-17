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
    <div className={`flex flex-col items-center gap-6 mt-16 ${className}`}>
      {/* Premium Navigation Pill */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white/40 backdrop-blur-xl border border-white rounded-2xl shadow-xl shadow-slate-200/50">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-xs group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="flex items-center gap-1 px-2 border-x border-slate-100">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={page === "..."}
              className={`min-w-[40px] h-10 flex items-center justify-center text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
                page === currentPage
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : page === "..."
                  ? "text-slate-300 cursor-default"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-xs group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Meta Stats Row */}
      <div className="flex flex-col sm:flex-row items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        {showPageInfo && (
          <div className="flex items-center gap-2">
             <span className="text-slate-300">Viewing Range</span>
             <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{startItem} - {endItem}</span>
             <span className="text-slate-300">from total</span>
             <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{totalItems}</span>
          </div>
        )}

        {showItemsPerPage && (
          <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
            <span className="text-slate-300">Density</span>
            <div className="flex gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100">
               {[6, 12, 24].map((size) => (
                 <button
                   key={size}
                   onClick={() => onItemsPerPageChange(size)}
                   className={`px-3 py-1 rounded-lg transition-all ${
                     itemsPerPage === size 
                       ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
                       : "text-slate-400 hover:text-slate-600"
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
