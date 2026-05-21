"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

/**
 * Fetches all platform-wide feedback records for the Line Manager's workspace.
 * Uses the exact explicit foreign key mappings verified from the working staff module.
 */
export async function GetAllPlatformFeedback() {
  console.log("⚙️ FUNCTION STARTED - GetAllPlatformFeedback");

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate user session and validate role metadata permissions
  const { data: { user } } = await supabase.auth.getUser();
  const userRole = user?.user_metadata?.role?.toLowerCase();

  if (!user || userRole !== "line_manager") {
    return { error: "Access denied: Line Manager privileges required.", data: [] };
  }

  // Query table using explicit schema foreign keys matching database definitions
  const { data, error } = await supabase
    .from("feedback")
    .select(`
      id,
      rating,
      comments,
      created_at,
      order:orders!feedback_order_id_fkey!inner (
        id,
        order_name,
        description,
        status,
        staff_id,
        requester:profiles!orders_requester_id_fkey (
          full_name
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching line manager global feedback records:", error);
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}