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
export async function getAuditLogs() {
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      id,
      action,
      timestamp,
      order_id,
      profiles (full_name)
    `)
    .order("timestamp", { ascending: false });

  if (error) throw new Error("Failed to fetch logs");

  return data || [];
}

export async function listAuditFiles() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.storage.from("audit_log").list();
  
  if (error || !data) return [];

  // Filter out any entries where created_at is null and sort safely
  return data
    .filter((file) => file.created_at !== null)
    .sort((a, b) => {
      const dateA = new Date(a.created_at as string).getTime();
      const dateB = new Date(b.created_at as string).getTime();
      return dateB - dateA; // Sort newest first
    });
}

export async function getFileContent(fileName: string) {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.storage.from("audit_log").download(fileName);
  
  if (error) return "Could not load log content.";
  
  // Convert blob to text
  return await data.text();
}

export async function getDownloadUrl(fileName: string) {
  const supabase = createClient(await cookies());
  const { data } = supabase.storage.from("audit_log").getPublicUrl(fileName);
  return data.publicUrl;
}