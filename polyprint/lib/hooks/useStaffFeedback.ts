import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { GetMyFeedBack } from "@/lib/Feedback/staff";

export function useStaffFeedback() {
  const supabase = createClient();
  
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<string>("all");

  async function refreshFeedbackData() {
    console.log("🔄 Fetching fresh feedback records from backend...");
    const { data, error } = await GetMyFeedBack();
    if (error) {
      console.error("❌ Failed to fetch staff feedback records:", error);
    } else if (data) {
      setFeedbackList(data);
    }
  }

  // 1. Initial Fetch
  useEffect(() => {
    async function initFetch() {
      await refreshFeedbackData();
      setLoading(false);
    }
    initFetch();
  }, []);

  // 2. Realtime Channel Subscription
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

  // 3. Compute Metrics
  const totalReviews = feedbackList.length;
  const averageRating = totalReviews
    ? (feedbackList.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  // 4. Client-side Filter Logic
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

  return {
    loading,
    searchQuery,
    setSearchQuery,
    selectedRating,
    setSelectedRating,
    totalReviews,
    averageRating,
    filteredFeedback,
  };
}