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

export async function getUser(userId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore); // Use standard client for session check
  const admin = createAdminClient();          // Use admin client for DB fetch

  try {
    // 1. Verify Authentication using the standard client
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !currentUser) {
      throw new Error("Unauthorized");
    }

    // 2. Check Authorization (Corrected logic)
    const role = (currentUser.app_metadata?.role || currentUser.user_metadata?.role || "").toLowerCase();
    const allowedRoles = ["admin", "line-manger", "staff"];

    if (!allowedRoles.includes(role)) {
      throw new Error("Access Denied: You do not have permission to view this profile");
    }

    // 3. Fetch specific user details from the profiles table
    const { data, error } = await admin
      .from('profiles')
      .select(`
        id, 
        full_name, 
        email, 
        role, 
        student_id, 
        manager_id, 
        created_at  
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("User not found");

    return { data, error: null };
  } catch (error: any) {
    console.error("getUser Error:", error.message);
    return { data: null, error: error.message };
  }
}

export async function deleteUser(userId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const admin = createAdminClient();

  try {
    // 1. Verify Admin Status
    const { data: { user } } = await supabase.auth.getUser();
    const role = (user?.app_metadata?.role || "").toLowerCase();
    
    if (role !== 'admin') {
      throw new Error("Access Denied: Admin privileges required.");
    }


    const { error: profileError } = await admin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) throw profileError;

    // Delete from Supabase Auth
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}


export async function updateUser(userId: string, updates: Partial<CreateUserInput>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    //  Get current user session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    //  Define who can edit profiles (Admin, Line-Manager, or the user themselves)
    const role = (user.app_metadata?.role || user.user_metadata?.role || "").toLowerCase();
    const isOwner = user.id === userId;
    const isAuthorized = role === "admin" || role === "line-manger" || isOwner;

    if (!isAuthorized) {
      throw new Error("Access Denied: You do not have permission to edit this profile.");
    }

    // Perform the update in the profiles table
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: updates.full_name,
        manager_id: updates.manager_id || null,
        student_id: updates.student_id || null,
      })
      .eq("id", userId);

    if (error) throw error;

    revalidatePath(`/users/${userId}`);
    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    console.error("updateUser Error:", error.message);
    return { error: error.message };
  }
}