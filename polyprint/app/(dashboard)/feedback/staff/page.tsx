"use client";

import { useStaffFeedback } from "@/lib/hooks/useStaffFeedback";
import FeedbackCard from "@/components/feedback/FeedbackCard";

export default function StaffFeedbackViewPage() {
  const {
    loading,
    searchQuery,
    setSearchQuery,
    selectedRating,
    setSelectedRating,
    totalReviews,
    averageRating,
    filteredFeedback,
  } = useStaffFeedback();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-slate-500 text-xs font-medium gap-2">
        <span className="animate-spin text-base">⏳</span> Loading received ratings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8">
      
      {/* Header Section */}
      <header className="border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0D284A]">
            My Service Performance
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2">
            Real-time insights and customer reviews on orders you have printed and processed.
          </p>
        </div>
        
        {/* Metric Overview Badges */}
        <div className="flex gap-3 w-full sm:w-auto self-start md:self-center">
          <div className="flex-1 sm:flex-initial bg-[#0D284A]/5 border border-[#0D284A]/10 px-4 py-2 rounded-2xl text-center min-w-[110px]">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Average Score</span>
            <span className="text-base sm:text-xl font-black text-[#0D284A] mt-0.5 inline-block">⭐ {averageRating}</span>
          </div>
          <div className="flex-1 sm:flex-initial bg-slate-50 border border-slate-200/60 px-4 py-2 rounded-2xl text-center min-w-[110px]">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Total Reviews</span>
            <span className="text-base sm:text-xl font-black text-slate-800 mt-0.5 inline-block">{totalReviews}</span>
          </div>
        </div>
      </header>

      {/* Control Panel: Search Bar and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by order name or student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-sm transition-colors"
          />
        </div>
        
        <div className="w-full sm:w-48">
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-slate-400 shadow-sm h-full font-medium"
          >
            <option value="all">⭐ All Scores</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
            <option value="4">⭐⭐⭐⭐ 4 Stars</option>
            <option value="3">⭐⭐⭐ 3 Stars</option>
            <option value="2">⭐⭐ 2 Stars</option>
            <option value="1">⭐ 1 Star</option>
          </select>
        </div>
      </div>

      {/* Main Content Render Queue */}
      {filteredFeedback.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-slate-50/60 border border-slate-200/60 rounded-3xl shadow-inner px-4">
          <span className="text-4xl sm:text-5xl block mb-3">🔎</span>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">No matching reviews</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search terminology or rating parameters.</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {filteredFeedback.map((item) => (
            <FeedbackCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}