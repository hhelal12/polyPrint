import { getApprovedOrdersForStaff } from "@/lib/orders/staffOrder";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ManageOrdersClient from "./ManageOrdersClient"; 

export const dynamic = "force-dynamic";

export default async function ManageOrdersPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const initialOrders = await getApprovedOrdersForStaff();

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id) 
        .single();

    return (
        <ManageOrdersClient 
            fullName={profile?.full_name || "Staff Member"} 
            initialOrders={initialOrders as any} 
        />
    );
}