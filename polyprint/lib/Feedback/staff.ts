"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function GetMyFeedBack() {
    console.log(" FUNCTION STARTED - GetMyFeedBack");

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    const userRole = user?.user_metadata?.role?.toLowerCase();

    if (!user || userRole !== "staff") {
        throw new Error("Access denied: Staff privileges required.");
    }

    // Queries feedback entries linked to orders handled by this specific staff member
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
        .eq("order.staff_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching staff feedback records:", error);
        return { error: error.message, data: [] };
    }

    return { data: data || [] };
}