"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { GetMyFeedBack } from "@/lib/Feedback/staff";

export default function StaffFeedbackViewPage() {
  const supabase = createClient();
  
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<string>("all");

  // Helper function to fetch and update state seamlessly
  async function refreshFeedbackData() {
    console.log("🔄 Fetching fresh feedback records from backend...");
    const { data, error } = await GetMyFeedBack();
    if (error) {
      console.error("❌ Failed to fetch staff feedback records:", error);
    } else if (data) {
      setFeedbackList(data);
    }
  }

  // 1. Initial Fetch on Component Mount
  useEffect(() => {
    async function initFetch() {
      await refreshFeedbackData();
      setLoading(false);
    }
    initFetch();
  }, []);

  // 2. Realtime Channel Subscription for Live Student Feedback Submissions
  useEffect(() => {
    console.log("📡 Subscribing to live feedback mutations...");

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "feedback",
        },
        (payload) => {
          console.log("🔥 LIVE INSERT DETECTED:", payload);
          // Directly pull fresh records from backend actions
          refreshFeedbackData();
        }
      )
      .subscribe((status) => {
        console.log("⚡ Supabase Stream Sync Status:", status);
      });

    return () => {
      console.log("🔌 Cleaning up live subscription channel...");
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. Compute General Metrics Summaries (based on all loaded records)
  const totalReviews = feedbackList.length;
  const averageRating = totalReviews
    ? (feedbackList.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  // 4. Client-side Filter and Search Logic
  const filteredFeedback = feedbackList.filter((item) => {
    const orderInfo = item.order || {};
    const studentName = orderInfo.requester?.full_name || "";
    const orderName = orderInfo.order_name || "";
    
    const matchesSearch = 
      orderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = 
      selectedRating === "all" || 
      item.rating === parseInt(selectedRating, 10);

    return matchesSearch && matchesRating;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-slate-500 text-xs font-medium gap-2">
        <span className="animate-spin">⏳</span> Loading received ratings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <header className="mb-10 border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0D284A]">My Service Performance</h1>
          <p className="text-slate-500 text-sm mt-2">
            Real-time insights and customer reviews on orders you have printed and processed.
          </p>
        </div>
        
        {/* Metric Overview Badges */}
        <div className="flex gap-3 self-start md:self-center">
          <div className="bg-[#0D284A]/5 border border-[#0D284A]/10 px-4 py-2 rounded-2xl text-center">
            <span className="text-xs text-slate-400 block font-semibold">Average Score</span>
            <span className="text-xl font-black text-[#0D284A]">⭐ {averageRating}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/60 px-4 py-2 rounded-2xl text-center">
            <span className="text-xs text-slate-400 block font-semibold">Total Reviews</span>
            <span className="text-xl font-black text-slate-800">{totalReviews}</span>
          </div>
        </div>
      </header>

      {/* Control Panel: Search Bar and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by order name or student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 text-xs bg-white border rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-sm transition-colors"
          />
        </div>
        
        <div className="w-full sm:w-48">
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-white border rounded-xl text-slate-700 focus:outline-none focus:border-slate-400 shadow-sm h-full font-medium"
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
        <div className="text-center py-20 bg-slate-50/60 border border-slate-200/60 rounded-3xl shadow-inner">
          <span className="text-5xl block mb-4">🔎</span>
          <h3 className="text-lg font-bold text-slate-800">No matching reviews</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search terminology or rating parameters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredFeedback.map((item) => {
            const orderInfo = item.order || {};
            const studentName = orderInfo.requester?.full_name || "Anonymous Student";

            return (
              <div 
                key={item.id} 
                className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center transition-all duration-200 shadow-sm hover:shadow-md/5"
              >
                <div className="flex-1 space-y-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md inline-block mb-1">
                      Order #{orderInfo.id?.slice(0, 8) || "N/A"}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900">{orderInfo.order_name || "Untitled Request"}</h3>
                    <p className="text-xs text-slate-400">
                      Fulfilled for: <span className="font-semibold text-slate-700">{studentName}</span>
                    </p>
                  </div>

                  {item.comments && (
                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-slate-700 text-xs italic">
                      "{item.comments}"
                    </div>
                  )}
                </div>

                {/* Read Only Star Rating Display layout */}
                <div className="w-full md:w-auto flex flex-col gap-1 items-start md:items-end bg-slate-50/50 md:bg-transparent p-4 md:p-0 rounded-xl">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg 
                        key={star} 
                        className={`w-6 h-6 ${
                          star <= item.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-transparent stroke-[1.5]"
                        }`} 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.151-.39 1.137-.39 1.288 0l2.622 6.772a1 1 0 00.942.684l7.19.645c.42.038.587.553.27.846l-5.467 5.06a1 1 0 00-.288.887l1.59 7.026c.093.41-.334.721-.692.5l-6.223-3.79a1 1 0 00-.964 0l-6.223 3.79c-.358.22-.785-.09-.692-.5l1.59-7.026a1 1 0 00-.288-.887l-5.467-5.06c-.317-.294-.15-.81.27-.846l7.19-.645a1 1 0 00.942-.684l2.622-6.772z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-medium">
                    Reviewed on {new Date(item.created_at).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}