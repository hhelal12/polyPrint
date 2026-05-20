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

    // Query orders with order_items to get file_url and include the new staff_id field
    const { data, error } = await supabase
        .from("orders")
        .select(`
            id,
            status,
            order_name,
            manager_notes, 
            created_at,
            staff_id,
            requester:profiles!orders_requester_id_fkey (full_name),
            order_items (
                file_url,
                service_type,
                quantity
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

    // Get current staff user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Update status and append the staff_id of the person executing the action
    const { error } = await supabase
        .from("orders")
        .update({ 
            status: newStatus,
            staff_id: user.id 
        })
        .eq("id", orderId);

    if (error) {
        console.error("Update Error:", error);
        throw error;
    }

    revalidatePath("/orders/manage");
    revalidatePath("/dashboard");
}

