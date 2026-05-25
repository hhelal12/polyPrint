// lib/orders/studentDash.ts
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getStudentDashboardStats(userId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    //  Get count of active orders (in_progress, pending, etc)
    const { count: activeCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("requester_id", userId)
        .in("status", ["pending", "in_progress", "submitted"]);

    //  Get count of ready orders
    const { count: readyCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("requester_id", userId)
        .eq("status", "ready_for_pickup");

    //  Get recent history
    const { data: recentOrders } = await supabase
        .from("orders")
        .select("id, order_name, status, created_at")
        .eq("requester_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

    return {
        activeCount: activeCount || 0,
        readyCount: readyCount || 0,
        recentOrders: recentOrders || []
    };
}