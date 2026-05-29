"use client";

import { useWorkspaceFeedback } from "@/lib/hooks/useWorkspaceFeedback";
import FeedbackItemCard from "@/components/dashboard/FeedbackItemCard";

interface FeedbackDashboardProps {
  initialFeedback: any[];
}

export default function LineManagerFeedbackDashboard({ initialFeedback }: FeedbackDashboardProps) {
  const {
    hasRealData,
    searchQuery,
    ratingFilter,
    currentPage,
    setCurrentPage,
    filteredFeedback,
    graphTotalReviews,
    graphAverageRating,
    distribution,
    maxDistributionValue,
    currentPagedItems,
    totalPages,
    handleSearchChange,
    handleRatingChange,
  } = useWorkspaceFeedback(initialFeedback);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-10">
      
      {!hasRealData && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-xl font-medium break-words">
           <strong>No records active:</strong> The database query returned 0 feedback entries for your account profile. Check Row Level Security (RLS) configurations if this is incorrect.
        </div>
      )}

      {/* Header Section */}
      <header className="border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[#0D284A]">
            Line Manager Feedback Workspace
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time metric distributions calculated from the latest 6 operational logs.
          </p>
        </div>

        {/* Highlight Analytics Score Badges */}
        <div className="flex gap-3 sm:gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-initial bg-[#0D284A] px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-white shadow-sm min-w-[110px] sm:min-w-[140px]">
            <span className="text-[9px] sm:text-[10px] text-slate-300 block font-bold uppercase tracking-wider">Latest 6 Avg</span>
            <span className="text-lg sm:text-2xl font-black mt-0.5 inline-block">⭐ {graphAverageRating}</span>
          </div>
          <div className="flex-1 md:flex-initial bg-white border border-slate-200 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-sm min-w-[110px] sm:min-w-[140px]">
            <span className="text-[9px] sm:text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Total Filtered</span>
            <span className="text-lg sm:text-2xl font-black text-slate-800 mt-0.5 inline-block">{filteredFeedback.length}</span>
          </div>
        </div>
      </header>

      {/* Analytics Custom Distribution Matrix Bar Chart Graph */}
      <section className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
        <h2 className="text-sm sm:text-base font-extrabold text-[#0D284A] mb-4 sm:mb-6 flex items-center gap-2">
          <span>📊</span> Distribution Matrix (Latest {graphTotalReviews} Records)
        </h2>

        <div className="w-full bg-slate-50/50 rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-slate-100/80">
          <div className="flex items-end justify-between h-40 sm:h-48 pt-4 px-1 sm:px-10 gap-1 sm:gap-6 select-none">
            {([1, 2, 3, 4, 5] as const).map((score) => {
              const count = distribution[score];
              const barHeight = `${(count / maxDistributionValue) * 100}%`;

              return (
                <div key={score} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                  
                  {/* Floating count indicator box - tap optimized for mobile */}
                  <span className="absolute -top-7 text-[9px] sm:text-[11px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded-md border border-slate-100 shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                    {count} <span className="hidden sm:inline">logged</span>
                  </span>
                  
                  <div
                    style={{ height: barHeight }}
                    className="w-full max-w-[16px] sm:max-w-[50px] bg-gradient-to-t from-[#0D284A] to-[#3CCFD0] rounded-t-md sm:rounded-t-lg transition-all duration-500 ease-out min-h-[6px] shadow-sm group-hover:brightness-95"
                  />
                  
                  <span className="text-[10px] sm:text-xs font-black text-slate-700 mt-1 whitespace-nowrap">
                    {score} <span className="text-[8px] sm:text-xs">⭐</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filter Input Control Grid Section */}
      <section className="flex flex-col sm:flex-row gap-3 p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by order, requester, or written metrics..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0D284A]/30 shadow-sm transition-colors"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={ratingFilter}
            onChange={(e) => handleRatingChange(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#0D284A]/30 shadow-sm h-full font-bold"
          >
            <option value="all">⭐ View All Scores</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
            <option value="4">⭐⭐⭐⭐ 4 Stars</option>
            <option value="3">⭐⭐⭐ 3 Stars</option>
            <option value="2">⭐⭐ 2 Stars</option>
            <option value="1">⭐ 1 Star</option>
          </select>
        </div>
      </section>

      {/* Main Content Grid Area */}
      {currentPagedItems.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-slate-50/40 border border-dashed border-slate-200 rounded-2xl sm:rounded-3xl px-4">
          <span className="text-3xl sm:text-4xl block mb-3">🔎</span>
          <h3 className="text-sm sm:text-base font-bold text-slate-700">No logs found matching parameters</h3>
          <p className="text-xs text-slate-400 mt-1">Modify your filter selection or clear keyword query items.</p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {currentPagedItems.map((item) => (
              <FeedbackItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* Interactive Pagination Controller Toolbar */}
          <div className="flex items-center justify-between sm:justify-center gap-2 pt-2 select-none w-full border-t border-slate-100 sm:border-none">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex-1 sm:flex-initial text-center px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              ◀ Prev
            </button>

            <div className="hidden sm:flex items-center gap-1.5 px-2">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                const isSinglePage = totalPages === 1;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => !isSinglePage && setCurrentPage(pageNum)}
                    disabled={isSinglePage}
                    className={`h-8 w-8 rounded-xl text-xs font-black transition-all ${
                      currentPage === pageNum
                        ? "bg-[#0D284A] text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    } disabled:pointer-events-none`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Mobile-only page counter marker label display */}
            <span className="sm:hidden text-xs font-bold text-slate-500 px-4">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 1}
              className="flex-1 sm:flex-initial text-center px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Next ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}