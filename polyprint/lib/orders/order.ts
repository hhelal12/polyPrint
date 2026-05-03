"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function submitOrderAction(formData: {
  service_type: string;
  paper_size: string;
  color_mode: string;
  quantity: number;
  file_url: string;
  special_instructions?: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    //  Create order without manager_id to avoid FK errors
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        requester_id: user.id,
        status: "pending_approval", // Matches your DB check constraint
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    //  Insert the specific details
    const { error: itemErr } = await supabase
      .from("order_items")
      .insert({
        order_id: order.id,
        service_type: formData.service_type,
        paper_size: formData.paper_size,
        color_mode: formData.color_mode,
        quantity: formData.quantity,
        file_url: formData.file_url,
        special_instructions: formData.special_instructions,
      });

    if (itemErr) throw itemErr;

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function approveOrderAction(orderId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
      .from("orders")
      .update({ 
        status: "approved", 
        manager_id: user.id  
      })
      .eq("id", orderId);

    if (error) throw error;

    revalidatePath("/dashboard/manager");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getMyOrders() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Fetch orders for the current user, including their linked items
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        status,
        manager_id,
        order_items (
          service_type,
          paper_size,
          color_mode,
          quantity,
          file_url
        )
      `)
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data };
  } catch (err: any) {
    console.error("Error fetching orders:", err.message);
    return { error: err.message };
  }
}