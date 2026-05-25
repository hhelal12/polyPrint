// lib/orders/staffDash.ts
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getStaffDashboardStats(userId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Get the current staff member's total completed orders
    const { count: myCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("staff_id", userId)
        .eq("status", "completed");

    // 2. Get the current total pending queue size
    const { count: pendingCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "in_progress");

    // 3. Calculate the Top Performing Staff Member
    const { data: completedOrders } = await supabase
        .from("orders")
        .select("staff_id")
        .eq("status", "completed")
        .not("staff_id", "is", null);

    let topStaffId: string | null = null;
    let topStaffCount = 0;
    let topStaffName = "No data yet";

    if (completedOrders && completedOrders.length > 0) {
        const staffCounts: Record<string, number> = {};
        completedOrders.forEach((order) => {
            if (order.staff_id) {
                staffCounts[order.staff_id] = (staffCounts[order.staff_id] || 0) + 1;
            }
        });

        for (const [id, count] of Object.entries(staffCounts)) {
            if (count > topStaffCount) {
                topStaffCount = count;
                topStaffId = id;
            }
        }

        if (topStaffId) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", topStaffId)
                .single();

            if (profile) topStaffName = profile.full_name || "Unknown Staff";
        }
    }

    return {
        myHandledCount: myCount || 0,
        pendingCount: pendingCount || 0,
        topStaffName,
        topStaffCount,
    };
}