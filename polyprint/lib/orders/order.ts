"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getCompleteOrders() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Grab all order_ids directly from feedback table.
    const { data: reviewedFeedback, error: feedbackError } = await supabase
      .from("feedback")
      .select("order_id");

    if (feedbackError) throw feedbackError;

    // Clean up the data into a flat array of string IDs
    const reviewedOrderIds = reviewedFeedback?.map(f => f.order_id).filter(Boolean) || [];

    // 2. Fetch completed orders (including total_price and staff_id)
    let query = supabase
      .from("orders")
      .select(`
        id,
        created_at,
        status,
        order_name,
        description,
        total_price,
        manager_id,
        staff_id,
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
      .eq("status", "completed");

    // 3. EXCLUDE the orders that have already received feedback
    if (reviewedOrderIds.length > 0) {
      query = query.not("id", "in", `(${reviewedOrderIds.join(",")})`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return { data };

  } catch (err: any) {
    console.error("Error fetching orders:", err.message);
    return { error: err.message };
  }
}

/**
 * Paginated query fetching pending requests for line managers.
 */
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
        total_price,
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

/**
 * Head-only aggregate counter for manager badges.
 */
export async function getPendingCount() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { count, error } = await supabase
    .from("orders")
    .select('*', { count: 'exact', head: true })
    .eq("status", "pending_approval");

  return count || 0;
}

/**
 * Updates status and injects review comments into the order context.
 */
export async function updateOrderStatusAction(
  orderId: string, 
  newStatus: "approved" | "rejected",
  managerNote?: string
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
        manager_notes: managerNote
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
 * Secured multi-dimensional pricing configuration matrix pipeline
 */
export async function submitOrderAction(formData: {
  order_name: string;
  description: string;
  service_type: string;
  paper_size: string;
  color_mode: string;
  print_sides: string;
  quantity: number;
  file_url: string;
  estimated_pages: number; 
  special_instructions?: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // ⚡ SECURE MULTI-DIMENSIONAL PRICING ENGINE MATRIX (A4 vs A3 vs A2)
    let pricePerSheetRate = 0.025; // Base fallback (A4 Black & White)
    const size = formData.paper_size?.toUpperCase() || "A4";
    const isColor = formData.color_mode?.toLowerCase() === "color";

    if (size === "A3") {
      pricePerSheetRate = isColor ? 0.100 : 0.050;
    } else if (size === "A2") {
      pricePerSheetRate = isColor ? 0.150 : 0.075;
    } else {
      // Default standard A4 matrices
      pricePerSheetRate = isColor ? 0.050 : 0.025;
    }

    const documentCopiesQuantity = Number(formData.quantity) || 1;
    const verifiedPages = Number(formData.estimated_pages) || 0;

    // Cut page counts exactly in half if double-sided layout parameters match, adjusting for odd numbers
    const sheetsPerCopy = formData.print_sides === "Double-sided"
      ? Math.ceil(verifiedPages / 2)
      : verifiedPages;

    const calculatedTotalPrice = sheetsPerCopy * documentCopiesQuantity * pricePerSheetRate;

    // 3. Create main order entry
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        requester_id: user.id,
        order_name: formData.order_name,
        description: formData.description,
        status: "pending_approval",
        total_price: calculatedTotalPrice 
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // 4. Insert item specifications layout parameters
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
    console.error("Order submission breakdown sequence encountered:", err.message);
    return { error: err.message };
  }
}

/**
 * Basic manager approval shortcut without specific review notes.
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
 * Fetches full layout history matching the currently authenticated requester.
 * Broken select parameters comment matrix block has been removed cleanly.
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
        total_price,
        manager_id,
        staff_id,
        order_items (
          service_type,
          paper_size,
          color_mode,
          print_sides,
          quantity,
          file_url,
          special_instructions
        ),
        feedback!left (
          rating,
          comments
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
