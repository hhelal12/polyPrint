"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getApprovedOrdersForStaff() {
    console.log("🚀 FUNCTION STARTED - getApprovedOrdersForStaff");
    
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    
    console.log(" Current User ID:", user?.id);
    console.log("User Role in Metadata:", user?.user_metadata?.role);
    console.log(" Full User Metadata:", JSON.stringify(user?.user_metadata, null, 2));
    
    // Query orders with order_items to get file_url
    const { data, error } = await supabase
        .from("orders")
        .select(`
            id,
            status,
            order_name,
            created_at,
            requester_id,
            requester:profiles!orders_requester_id_fkey (full_name),
            order_items (
                id,
                file_url,
                service_type,
                quantity,
                paper_size,
                color_mode
            )
        `)
        .in('status', ['approved', 'in_progress'])
        .order("created_at", { ascending: true });

    console.log(" Filtered orders:", data);
    console.log(" Query error:", error);
    console.log(" Number of orders found:", data?.length || 0);
    
    if (error) {
        console.error("Database error:", error);
        return [];
    }
    
    return data || [];
}

export async function updateOrderStatusAction(orderId: string, newStatus: "in_progress" | "completed") {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

    if (error) {
        console.error("Update Error:", error);
        throw error;
    }

    revalidatePath("/orders/manage");
    revalidatePath("/dashboard");
}