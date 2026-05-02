"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

type CreateUserInput = {
  full_name: string;
  email: string;
  role: string;
  manager_id?: string;
  student_id?: string;
};

export async function getAllUsers() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const userRole = user.app_metadata?.role || user.user_metadata?.role;
    if (userRole?.toLowerCase() !== 'admin') {
      return { data: null, error: "Access Denied: Admin privileges required" };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, student_id, manager_id, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function createUser({
  full_name,
  email,
  role,
  manager_id,
  student_id,
}: CreateUserInput) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const admin = createAdminClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const currentUserRole = user.app_metadata?.role || user.user_metadata?.role;
    if (currentUserRole?.toLowerCase() !== "admin") {
      throw new Error("Only admins can create users");
    }

    // Invite the user and specify the redirect path
    const { data: invitedUser, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/setup-password`,
        data: { full_name, role },
      });

    if (inviteError) throw inviteError;
    
    const newUserId = invitedUser.user?.id;
    if (!newUserId) throw new Error("Failed to create invited user");

    // Upsert to handle profiles table entry and prevent Duplicate Key errors
    const { error: profileError } = await admin
      .from("profiles")
      .upsert({
        id: newUserId,
        full_name,
        email,
        role,
        manager_id: manager_id || null,
        student_id: student_id || null,
      }, {
        onConflict: 'id' 
      });

    if (profileError) throw profileError;

    revalidatePath("/users");
    return { data: invitedUser, error: null };
  } catch (error: any) {
    console.error("createUser Error:", error.message);
    return { data: null, error: error.message };
  }
}