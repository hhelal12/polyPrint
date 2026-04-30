import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return {
    user,
    profile,
    fullName:
      profile?.full_name ||
      user.email?.split("@")[0] ||
      "User",
    role: profile?.role || "Student",
  };
}