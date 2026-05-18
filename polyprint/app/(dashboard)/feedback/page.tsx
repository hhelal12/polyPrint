"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getCompleteOrders } from "@/lib/orders/order";
import Popup from "@/components/ui/Popup"; 

export default function StudentFeedbackPage() {
  const supabase = createClient();
  
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [hoveredStars, setHoveredStars] = useState<{ [key: string]: number | null }>({});
  const [comments, setComments] = useState<{ [key: string]: string }>({});

  const [popupConfig, setPopupConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "success",
  });

  // 1. Initial Fetch on Component Mount
  useEffect(() => {
    async function initFetch() {
      const { data, error } = await getCompleteOrders();
      if (error) {
        console.error("Failed to fetch initial completed orders:", error);
      } else if (data) {
        setCompletedOrders(data);
      }
      setLoading(false);
    }
    initFetch();
  }, []);

  // 2. Realtime Channel Subscription with Duplication Safeguards
  useEffect(() => {
    let userUuid: string;
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userUuid = user.id;

      const channel = supabase
        .channel("live_completed_orders")
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `requester_id=eq.${userUuid}`
        }, async (payload) => {
          const updatedRow = payload.new;
          
          if (updatedRow.status === "completed") {
            // 🛑 CRITICAL CHECK: Verify if this order already has a saved feedback row
            const { data: existingFeedback } = await supabase
              .from("feedback")
              .select("id")
              .eq("order_id", updatedRow.id)
              .maybeSingle();

            // If feedback already exists, ignore this realtime update event completely
            if (existingFeedback) return;

            const { data: newItem } = await supabase
              .from("orders")
              .select("id, order_name, created_at, status, order_items ( service_type, quantity )")
              .eq("id", updatedRow.id)
              .single();

            if (newItem) {
              setCompletedOrders((prev) => prev.some((o) => o.id === newItem.id) ? prev : [newItem, ...prev]);
            }
          } else {
            // If the status transitions away from completed, drop it out of view
            setCompletedOrders((prev) => prev.filter((o) => o.id !== updatedRow.id));
          }
        }).subscribe();
      return channel;
    };

    const channelPromise = setupSubscription();
    return () => { channelPromise.then((channel) => { if (channel) supabase.removeChannel(channel); }); };
  }, []);

  // 3. Handle Feedback Form Submissions
  const handleSubmitFeedback = async (orderId: string) => {
    const rating = ratings[orderId] || 5;
    const comment = comments[orderId] || "";

    setSubmittingId(orderId);

    // Remove the row from the local state UI array immediately 
    // to stop layout flickering before database confirmations arrive
    setCompletedOrders((prev) => prev.filter((o) => o.id !== orderId));

    const { error } = await supabase
      .from("feedback")
      .insert([{ order_id: orderId, rating, comments: comment, created_at: new Date().toISOString() }]);

    setSubmittingId(null);

    if (error) {
      // If saving fails, fetch the backend data queue again to restore state accurately
      const { data } = await getCompleteOrders();
      if (data) setCompletedOrders(data);

      setPopupConfig({
        isOpen: true,
        title: "Submission Error",
        message: error.message || "Something went wrong saving your record.",
        variant: "error"
      });
    } else {
      setPopupConfig({
        isOpen: true,
        title: "Feedback Submitted!",
        message: "Thank you for your rating! PolyPrint values your input. Your insights help improve service metrics across Bahrain Polytechnic.",
        variant: "success"
      });

      // Clear the inputs for this specific card
      setRatings((prev) => { const copy = { ...prev }; delete copy[orderId]; return copy; });
      setComments((prev) => { const copy = { ...prev }; delete copy[orderId]; return copy; });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-slate-500 text-xs font-medium gap-2">
        <span className="animate-spin">⏳</span> Loading review items...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <header className="mb-10 border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-[#0D284A]">Order Feedback</h1>
        <p className="text-slate-500 text-sm mt-2">
          Items drop into this view instantly without refresh when processing targets finish.
        </p>
      </header>

      {completedOrders.length === 0 ? (
        <div className="text-center py-20 bg-slate-50/60 border border-slate-200/60 rounded-3xl shadow-inner">
          <span className="text-5xl block mb-4">🎉</span>
          <h3 className="text-lg font-bold text-slate-800">All caught up!</h3>
          <p className="text-xs text-slate-400 mt-1">No completed orders are waiting for reviews.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {completedOrders.map((order) => {
            const currentRating = ratings[order.id] || 0;
            const currentHover = hoveredStars[order.id] !== undefined ? hoveredStars[order.id] : null;
            const displayRating = currentHover !== null ? currentHover : currentRating;

            return (
              <div 
                key={order.id} 
                className={`bg-white border rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-8 items-stretch transition-all duration-200 ${
                  currentRating > 0 ? "border-cyan-500/20 bg-cyan-50/5" : "border-slate-100"
                }`}
              >
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">{order.order_name || "Untitled Request"}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Type: <span className="font-semibold text-slate-800">{order.order_items?.[0]?.service_type || "Standard Printing"}</span>
                    </p>
                  </div>

                  <div className="mt-6">
                    <div 
                      className="flex items-center gap-1 bg-slate-50 inline-flex p-2 rounded-xl border border-slate-100" 
                      onMouseLeave={() => setHoveredStars({ ...hoveredStars, [order.id]: null })}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          type="button" 
                          onClick={() => setRatings({ ...ratings, [order.id]: star })} 
                          onMouseEnter={() => setHoveredStars({ ...hoveredStars, [order.id]: star })} 
                          className="p-1 focus:outline-none transition-transform active:scale-90"
                        >
                          <svg 
                            className={`w-9 h-9 transition-colors duration-150 ${
                              star <= (displayRating ?? 0) ? "text-amber-400 fill-amber-400" : "text-slate-300 fill-transparent stroke-[1.5]"
                            }`} 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.151-.39 1.137-.39 1.288 0l2.622 6.772a1 1 0 00.942.684l7.19.645c.42.038.587.553.27.846l-5.467 5.06a1 1 0 00-.288.887l1.59 7.026c.093.41-.334.721-.692.5l-6.223-3.79a1 1 0 00-.964 0l-6.223 3.79c-.358.22-.785-.09-.692-.5l1.59-7.026a1 1 0 00-.288-.887l-5.467-5.06c-.317-.294-.15-.81.27-.846l7.19-.645a1 1 0 00.942-.684l2.622-6.772z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-80 flex flex-col gap-3 justify-between bg-slate-50/40 p-4 rounded-xl border border-slate-100">
                  <textarea 
                    rows={3} 
                    value={comments[order.id] || ""} 
                    onChange={(e) => setComments({ ...comments, [order.id]: e.target.value })} 
                    placeholder="Comments regarding quality..." 
                    className="w-full p-3 text-xs border rounded-xl bg-white resize-none focus:outline-none focus:border-slate-400 text-slate-700" 
                  />
                  <button 
                    type="button" 
                    disabled={submittingId === order.id || !currentRating} 
                    onClick={() => handleSubmitFeedback(order.id)} 
                    className={`w-full py-3 rounded-xl text-xs font-extrabold text-white transition-all ${
                      !currentRating ? "bg-slate-300 cursor-not-allowed" : "bg-[#0D284A] hover:bg-slate-800"
                    }`}
                  >
                    {submittingId === order.id ? "Saving..." : "Submit Review"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Popup
        isOpen={popupConfig.isOpen}
        title={popupConfig.title}
        message={popupConfig.message}
        variant={popupConfig.variant}
        onClose={() => setPopupConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}