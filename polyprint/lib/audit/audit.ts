"use server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function generateAndUploadAuditLog() {
  // Use the same client pattern as your dashboard
  const supabase = createClient(await cookies());

  // Fetch logs with the join
  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select(`
      timestamp, 
      action, 
      profiles (
        full_name
      )
    `)
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Database fetch error:", error);
    throw new Error("Failed to fetch logs");
  }

  // Map to .log format
  const logContent = logs && logs.length > 0 
    ? logs.map(log => {
        const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
        return `[${log.timestamp}] ACTION: ${log.action} | USER: ${profile?.full_name || 'System'}`;
      }).join("\n")
    : "No logs found.";

  const fileName = `audit_${new Date().toISOString().split('T')[0]}.log`;
  const buffer = Buffer.from(logContent, 'utf-8');

  // Upload to the "audit_log" bucket
  const { error: uploadError } = await supabase.storage
    .from("audit_log")
    .upload(fileName, buffer, { 
      contentType: "text/plain",
      upsert: true 
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from("audit_log")
    .getPublicUrl(fileName);

  return publicUrl;
}