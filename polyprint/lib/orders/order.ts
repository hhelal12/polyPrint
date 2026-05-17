"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";


export async function getPendingOrdersForManager(page: number = 0, pageSize: number = 8) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const from = page * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data, error, count } = await supabase
      .from("orders")
      .select(`
        id,
        order_name,
        description,
        status,
        created_at,
        requester:profiles!requester_id (
          full_name
        ),
        order_items (
          service_type,
          quantity,
          paper_size,
          color_mode,
          print_sides,
          file_url,
          special_instructions
        )
      `, { count: 'exact' })
      .eq("status", "pending_approval")
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) throw error;
    return { data: data || [], totalCount: count || 0 };
  } catch (err: any) {
    console.error("Fetch Error:", err.message);
    return { error: err.message, data: [], totalCount: 0 };
  }
}

export async function getPendingCount() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { count, error } = await supabase
    .from("orders")
    .select('*', { count: 'exact', head: true })
    .eq("status", "pending_approval");

  return count || 0;
}

export async function updateOrderStatusAction(
  orderId: string, 
  newStatus: "approved" | "rejected",
  managerNote?: string // Added parameter
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role?.toLowerCase();
    if (role !== "line_manager" && role !== "manager") {
      throw new Error("Access Denied: Manager permissions required.");
    }

    const { error } = await supabase
      .from("orders")
      .update({ 
        status: newStatus, 
        manager_id: user.id,
        manager_notes: managerNote // Saves the note to DB
      })
      .eq("id", orderId);

    if (error) throw error;

    revalidatePath("/dashboard/manager"); 
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function submitOrderAction(formData: {
  order_name: string;
  description: string;
  service_type: string;
  paper_size: string;
  color_mode: string;
  print_sides: string;
  quantity: number;
  file_url: string;
  special_instructions?: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Create main order entry
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        requester_id: user.id,
        order_name: formData.order_name,
        description: formData.description,
        status: "pending_approval", // Ensure this matches your DB Check Constraint
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // 2. Insert item specifications (One-sided vs Double-sided, etc.)
    const { error: itemErr } = await supabase
      .from("order_items")
      .insert({
        order_id: order.id,
        service_type: formData.service_type,
        paper_size: formData.paper_size,
        color_mode: formData.color_mode,
        print_sides: formData.print_sides,
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

/**
 * STEP 4: Manager Approval
 * Updates status and captures the logged-in manager's ID.
 */
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

/**
 * Retrieval: Fetch all orders for the current student.
 * Includes nested print specifications.
 */
export async function getMyOrders() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        status,
        order_name,
        description,
        manager_id,
        order_items (
          service_type,
          paper_size,
          color_mode,
          print_sides,
          quantity,
          file_url,
          special_instructions
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