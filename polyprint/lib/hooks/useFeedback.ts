import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getCompleteOrders } from "@/lib/orders/order";
import { logAction } from "@/lib/audit/logger";

export type PopupConfig = {
  isOpen: boolean;
  title: string;
  message: string;
  variant: "success" | "error" | "info";
};

export function useFeedback() {
  const supabase = createClient();

  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [hoveredStars, setHoveredStars] = useState<Record<string, number | null>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [popupConfig, setPopupConfig] = useState<PopupConfig>({
    isOpen: false, title: "", message: "", variant: "success",
  });

  // ── Initial fetch ──
  useEffect(() => {
    async function initFetch() {
      const { data, error } = await getCompleteOrders();
      if (!error && data) setCompletedOrders(data);
      setLoading(false);
    }
    initFetch();
  }, []);

  // ── Realtime subscription ──
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel("live_completed_orders")
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `requester_id=eq.${user.id}`,
        }, async (payload) => {
          const updatedRow = payload.new;

          if (updatedRow.status === "completed") {
            const { data: existingFeedback } = await supabase
              .from("feedback").select("id").eq("order_id", updatedRow.id).maybeSingle();
            if (existingFeedback) return;

            const { data: newItem } = await supabase
              .from("orders")
              .select("id, order_name, created_at, status, total_price, order_items ( service_type, quantity )")
              .eq("id", updatedRow.id).single();

            if (newItem) {
              setCompletedOrders((prev) =>
                prev.some((o) => o.id === newItem.id) ? prev : [newItem, ...prev]
              );
            }
          } else {
            setCompletedOrders((prev) => prev.filter((o) => o.id !== updatedRow.id));
          }
        }).subscribe();

      return channel;
    };

    const channelPromise = setupSubscription();
    return () => {
      channelPromise.then((channel) => { if (channel) supabase.removeChannel(channel); });
    };
  }, []);

  // ── Submit feedback ──
  const handleSubmitFeedback = async (orderId: string) => {
    const rating = ratings[orderId] || 5;
    const comment = comments[orderId] || "";

    setSubmittingId(orderId);
    setCompletedOrders((prev) => prev.filter((o) => o.id !== orderId));

    const { error } = await supabase
      .from("feedback")
      .insert([{ order_id: orderId, rating, comments: comment, created_at: new Date().toISOString() }]);

    setSubmittingId(null);

    if (error) {
      const { data } = await getCompleteOrders();
      if (data) setCompletedOrders(data);
      setPopupConfig({ isOpen: true, title: "Submission Error", message: error.message, variant: "error" });
    } else {
      await logAction(`Feedback submitted for Order ID: ${orderId} (Rating: ${rating})`);
      setPopupConfig({
        isOpen: true,
        title: "Feedback Submitted!",
        message: "Thank you for your rating! Your insights help improve service metrics across Bahrain Polytechnic.",
        variant: "success",
      });
      setRatings((prev) => { const c = { ...prev }; delete c[orderId]; return c; });
      setComments((prev) => { const c = { ...prev }; delete c[orderId]; return c; });
    }
  };

  const closePopup = () => setPopupConfig((p) => ({ ...p, isOpen: false }));

  return {
    completedOrders, loading, submittingId,
    ratings, setRatings,
    hoveredStars, setHoveredStars,
    comments, setComments,
    popupConfig, closePopup,
    handleSubmitFeedback,
  };
}