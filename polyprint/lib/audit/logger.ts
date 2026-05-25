"use server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function logAction(action: string) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await supabase.from("audit_logs").insert({
      action: action,
      user_id: user.id
    });
  }
}