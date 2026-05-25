"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getDetailedManagerAnalytics() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id, status, created_at,
      order_items(service_type),
      feedback(rating)
    `);

  if (!orders) return null;

  // 1. Orders by Status
  const statusCounts = orders.reduce((acc, o) => {
    const status = o.status ?? "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. Orders per Month (Initialized)
  const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyOrders = allMonths.reduce((acc, month) => {
    acc[month] = 0;
    return acc;
  }, {} as Record<string, number>);

  orders.forEach((o) => {
    const date = o.created_at ? new Date(o.created_at) : new Date();
    const month = date.toLocaleString('default', { month: 'short' });
    if (monthlyOrders.hasOwnProperty(month)) monthlyOrders[month] += 1;
  });

  // 3. Feedback Ratings (Fixed 1-5 scale)
  const feedbackRatings = [1, 2, 3, 4, 5].reduce((acc, r) => {
    acc[r] = 0;
    return acc;
  }, {} as Record<number, number>);

  orders.flatMap(o => o.feedback || []).forEach(f => {
    if (f.rating !== null && feedbackRatings.hasOwnProperty(f.rating)) {
      feedbackRatings[f.rating] += 1;
    }
  });

  // 4. Most Requested Services
  const servicePopularity = orders
    .flatMap(o => o.order_items || [])
    .reduce((acc, item) => {
      const service = item.service_type ?? "Unknown";
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return { statusCounts, monthlyOrders, feedbackRatings, servicePopularity };
}