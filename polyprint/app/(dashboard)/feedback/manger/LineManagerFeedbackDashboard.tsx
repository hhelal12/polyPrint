"use client";

import { useState } from "react";

interface FeedbackDashboardProps {
  initialFeedback: any[];
}

export default function LineManagerFeedbackDashboard({ initialFeedback }: FeedbackDashboardProps) {
  // Check if live data was fetched, otherwise default to a clean state array
  const hasRealData = Array.isArray(initialFeedback) && initialFeedback.length > 0;
  const [feedbackList] = useState<any[]>(initialFeedback || []);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  // Client Pagination States (6 items per page block limit)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 1. Dynamic Client-Side Searching & Filtering
  const filteredFeedback = feedbackList.filter((item) => {
    const orderInfo = item.order || {};
    const studentName = orderInfo.requester?.full_name || "";
    const orderName = orderInfo.order_name || "";
    const commentsText = item.comments || "";

    const matchesSearch =
      orderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commentsText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating =
      ratingFilter === "all" || item.rating === parseInt(ratingFilter, 10);

    return matchesSearch && matchesRating;
  });

  // 2. Capped strictly to the latest 6 matching elements for the analytics distribution matrix
  const latestSixForGraph = filteredFeedback.slice(0, 6);
  const graphTotalReviews = latestSixForGraph.length;
  const graphAverageRating = graphTotalReviews
    ? (latestSixForGraph.reduce((acc, curr) => acc + curr.rating, 0) / graphTotalReviews).toFixed(1)
    : "0.0";

  // Distribution maps calculated dynamically for the 6 visible matrix bars
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  latestSixForGraph.forEach((item) => {
    if (item.rating >= 1 && item.rating <= 5) {
      distribution[item.rating as 1 | 2 | 3 | 4 | 5]++;
    }
  });

  const maxDistributionValue = Math.max(...Object.values(distribution), 1);

  //  Pagination Window Calculations (6 Cards per grid page layout)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  const currentPagedItems = filteredFeedback.slice(indexOfFirstItem, indexOfLastItem);
  // Ensure totalPages is at least 1 so a page number button always renders
  const totalPages = Math.max(Math.ceil(filteredFeedback.length / itemsPerPage), 1);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleRatingChange = (val: string) => {
    setRatingFilter(val);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10">

      {/* Database Empty Alert Bar */}
      {!hasRealData && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-xl font-medium">
          ⚠️ <strong>No records active:</strong> The database query returned 0 feedback entries for your account profile. Check Row Level Security (RLS) configurations if this is incorrect.
        </div>
      )}

      {/* Header Section */}
      <header className="border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0D284A]">Line Manager Feedback Workspace</h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time metric distributions calculated from the latest 6 operational logs.
          </p>
        </div>

        {/* Dashboard Highlight Analytics Score Count Badges */}
        <div className="flex gap-4">
          <div className="bg-[#0D284A] px-5 py-3 rounded-2xl text-white shadow-sm min-w-[140px]">
            <span className="text-[10px] text-slate-300 block font-bold uppercase tracking-wider">Latest 6 Avg</span>
            <span className="text-2xl font-black">⭐ {graphAverageRating}</span>
          </div>
          <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm min-w-[140px]">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Total Filtered</span>
            <span className="text-2xl font-black text-slate-800">{filteredFeedback.length}</span>
          </div>
        </div>
      </header>

      {/* Analytics Graph Grid Module (Capped at top 6 elements) */}
      <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-extrabold text-[#0D284A] mb-6 flex items-center gap-2">
          📊 Distribution Matrix (Latest {graphTotalReviews} Records)
        </h2>

        <div className="w-full bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80">
          <div className="flex items-end justify-between h-48 pt-4 px-4 sm:px-10 gap-2 sm:gap-6">
            {([1, 2, 3, 4, 5] as const).map((score) => {
              const count = distribution[score];
              const barHeight = `${(count / maxDistributionValue) * 100}%`;

              return (
                <div key={score} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 mb-1">
                    {count} logged
                  </span>
                  <div
                    style={{ height: barHeight }}
                    className="w-full max-w-[50px] bg-gradient-to-t from-[#0D284A] to-[#3CCFD0] rounded-t-lg transition-all duration-500 ease-out min-h-[6px] shadow-sm group-hover:brightness-95"
                  />
                  <span className="text-xs font-black text-slate-700 mt-1">
                    {score} ⭐
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filter Control Section */}
      <section className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by order names, requester, or written submission metrics..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2.5 text-xs bg-white border rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0D284A]/30 shadow-sm transition-colors"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={ratingFilter}
            onChange={(e) => handleRatingChange(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-white border rounded-xl text-slate-700 focus:outline-none focus:border-[#0D284A]/30 shadow-sm h-full font-bold"
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

      {/* Main Submissions Layout Area (Paginated View Window) */}
      {currentPagedItems.length === 0 ? (
        <div className="text-center py-20 bg-slate-50/40 border border-dashed border-slate-200 rounded-3xl">
          <span className="text-4xl block mb-3">🔎</span>
          <h3 className="text-base font-bold text-slate-700">No logs found matching parameters</h3>
          <p className="text-xs text-slate-400 mt-1">Modify your filter selection or clear keyword query items.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentPagedItems.map((item) => {
              const orderInfo = item.order || {};
              const studentName = orderInfo.requester?.full_name || "Anonymous Requester";

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-between gap-4 transition-all duration-200 shadow-sm hover:shadow-md hover:border-slate-200/60"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md inline-block mb-1">
                          Order Key: #{orderInfo.id?.slice(0, 8) || "N/A"}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 line-clamp-1">{orderInfo.order_name || "Untitled Request"}</h3>
                        <p className="text-xs text-slate-400">
                          Requester: <span className="font-semibold text-slate-700">{studentName}</span>
                        </p>
                      </div>

                      <div className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 border border-amber-100">
                        ⭐ {item.rating}
                      </div>
                    </div>

                    {item.comments ? (
                      <p className="bg-slate-50/70 p-3 rounded-xl border border-slate-100/60 text-slate-600 text-xs italic leading-relaxed">
                        "{item.comments}"
                      </p>
                    ) : (
                      <p className="text-slate-300 text-xs italic pl-1">No additional commentary provided.</p>
                    )}
                  </div>

                  <div className="border-t border-slate-50 pt-3 text-[10px] text-slate-400 flex justify-between items-center">
                    <span>Logged Date</span>
                    <span className="font-medium text-slate-500">
                      {new Date(item.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/*  Always visible interactive toolbar wrapper layout */}
          <div className="flex items-center justify-center gap-2 pt-4 select-none">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              ◀ Previous
            </button>

            <div className="flex items-center gap-1.5 px-2">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                const isSinglePage = totalPages === 1;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => !isSinglePage && setCurrentPage(pageNum)}
                    disabled={isSinglePage}
                    className={`h-7 w-7 rounded-lg text-xs font-black transition-all ${
                      currentPage === pageNum
                        ? "bg-[#0D284A] text-white shadow-sm disabled:opacity-100"
                        : "border bg-white text-slate-600 hover:bg-slate-50"
                    } disabled:pointer-events-none`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 1}
              className="px-3 py-1.5 rounded-lg border text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Next ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}