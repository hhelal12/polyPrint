"use server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getAdminDashboardData() {
  const supabase = createClient(await cookies());

  const [ordersResponse, profilesResponse, auditLogsResponse] = await Promise.all([
    supabase.from("orders").select("status, total_price, created_at"),
    supabase.from("profiles").select("role"),
    supabase.from("audit_logs").select("*", { count: 'exact', head: true })
  ]);

  const orders = ordersResponse.data || [];
  
  // Normalize and aggregate statuses
  const statusCounts = orders.reduce((acc, o) => {
    const status = o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1).toLowerCase() : "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    kpi: {
      totalOrders: orders.length,
      completed: statusCounts['Completed'] || 0,
      pending: statusCounts['Pending_approval'] || 0,
      totalRevenue: orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0)
    },
    statusCounts,
    roleCounts: profilesResponse.data?.reduce((acc, p) => {
      const role = p.role ?? "Unassigned";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    totalAuditLogs: auditLogsResponse.count || 0
  };
}