import React from "react";

/**
 * Premium Skeleton Loading Component
 */

const SkeletonElement = ({ width, height, rounded = "rounded-2xl" }) => {
  return (
    <div
      className={`skeleton-shimmer bg-slate-100 ${rounded}`}
      style={{
        width: width || "100%",
        height: height || "1rem",
      }}
    />
  );
};

export const SkeletonText = ({ lines = 3, className = "" }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonElement
          key={index}
          height="0.75rem"
          width={index === lines - 1 ? "40%" : "100%"}
        />
      ))}
    </div>
  );
};

export const SkeletonProjectCard = () => {
  return (
    <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm space-y-6">
      <div className="flex justify-between items-start">
        <SkeletonElement height="1.5rem" width="40%" rounded="rounded-xl" />
        <SkeletonElement height="1rem" width="3rem" rounded="rounded-full" />
      </div>
      
      <div className="flex items-start gap-3">
        <SkeletonElement height="3rem" width="3rem" rounded="rounded-2xl" />
        <div className="flex-1 space-y-2">
           <SkeletonElement height="1.25rem" width="80%" />
           <SkeletonElement height="0.75rem" width="40%" />
        </div>
      </div>

      <div className="flex gap-2">
        <SkeletonElement height="2.5rem" width="100%" rounded="rounded-xl" />
        <SkeletonElement height="2.5rem" width="100%" rounded="rounded-xl" />
      </div>

      <div className="space-y-2 pt-2">
        <SkeletonElement height="2.5rem" width="100%" rounded="rounded-xl" />
      </div>
      
      <div className="pt-4 border-t border-slate-50 flex gap-3">
         <SkeletonElement height="3rem" width="100%" rounded="rounded-xl" />
         <SkeletonElement height="3rem" width="3rem" rounded="rounded-xl" />
      </div>
    </div>
  );
};

export const SkeletonQuizCard = () => {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 space-y-8">
      <SkeletonElement height="2.5rem" width="100%" rounded="rounded-xl" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <SkeletonElement height="1.5rem" width="1.5rem" rounded="rounded-full" />
            <SkeletonElement height="1rem" width="60%" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonStatsCard = () => {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <SkeletonElement height="1rem" width="50%" rounded="rounded-lg" />
        <SkeletonElement height="2.5rem" width="2.5rem" rounded="rounded-xl" />
      </div>
      <SkeletonElement height="2.5rem" width="60%" className="mb-2" />
      <SkeletonElement height="1rem" width="80%" />
    </div>
  );
};

export const SkeletonTableRow = ({ columns = 4 }) => {
  return (
    <tr className="border-b border-slate-50">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <SkeletonElement height="1rem" width={index === 0 ? "80%" : "60%"} />
        </td>
      ))}
    </tr>
  );
};

export const SkeletonChallengeCard = () => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <SkeletonElement height="1rem" width="4rem" rounded="rounded-full" className="bg-white/20" />
          <SkeletonElement height="2rem" width="6rem" rounded="rounded-xl" className="bg-white/20" />
        </div>
        <SkeletonElement height="2rem" width="80%" rounded="rounded-xl" className="bg-white/20" />
      </div>
      <div className="p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonElement height="1.25rem" width="1.25rem" rounded="rounded-full" />
            <SkeletonElement height="1rem" width={60 + (i * 10) + "%"} />
          </div>
        ))}
        <div className="pt-4">
           <SkeletonElement height="3.5rem" width="100%" rounded="rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonTableItem = () => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <SkeletonElement height="1.25rem" width="60%" />
        <SkeletonElement height="1rem" width="3rem" rounded="rounded-full" />
      </div>
      <div className="space-y-2">
        <SkeletonElement height="0.75rem" width="90%" />
        <SkeletonElement height="0.75rem" width="40%" />
      </div>
      <div className="flex items-center gap-4 pt-2">
        <SkeletonElement height="1rem" width="4rem" />
        <SkeletonElement height="1rem" width="4rem" />
      </div>
    </div>
  );
};

export const SkeletonCard = ({ className = "" }) => {
  return (
    <div className={`bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 space-y-6 ${className}`}>
      <SkeletonElement height="2rem" width="50%" />
      <SkeletonText lines={3} />
      <div className="flex gap-3">
        <SkeletonElement height="3rem" width="100%" rounded="rounded-2xl" />
        <SkeletonElement height="3rem" width="100%" rounded="rounded-2xl" />
      </div>
    </div>
  );
};

const SkeletonLoading = ({ 
  type = "text", 
  count = 1, 
  className = "",
  children 
}) => {
  React.useEffect(() => {
    if (!document.getElementById('skeleton-shimmer-style')) {
      const style = document.createElement('style');
      style.id = 'skeleton-shimmer-style';
      style.textContent = `
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            #f8fafc 0%,
            #f1f5f9 20%,
            #f8fafc 40%,
            #f8fafc 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite linear;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const renderSkeleton = () => {
    switch (type) {
      case "project":
        return Array.from({ length: count }).map((_, i) => <SkeletonProjectCard key={i} />);
      case "quiz":
        return Array.from({ length: count }).map((_, i) => <SkeletonQuizCard key={i} />);
      case "stats":
        return Array.from({ length: count }).map((_, i) => <SkeletonStatsCard key={i} />);
      case "challenge":
        return Array.from({ length: count }).map((_, i) => <SkeletonChallengeCard key={i} />);
      case "table":
        return (
          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <th key={i} className="px-6 py-4 text-left">
                      <SkeletonElement height="1rem" width="60%" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: count }).map((_, i) => (
                  <SkeletonTableRow key={i} columns={4} />
                ))}
              </tbody>
            </table>
          </div>
        );
      case "text":
      default:
        return Array.from({ length: count }).map((_, i) => <SkeletonText key={i} className={className} />);
    }
  };

  if (children) return <div className="skeleton-shimmer">{children}</div>;

  return <div className={`space-y-6 ${className}`}>{renderSkeleton()}</div>;
};

export default SkeletonLoading;

