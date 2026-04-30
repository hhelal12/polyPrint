import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

// Import your role-specific components
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import StaffDashboard from "@/components/dashboard/StaffDashboard";
import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import GuestDashboard from "@/components/dashboard/GuestDashboard";

export default async function DashboardPage() {
    const data = await getCurrentUser();

    if (!data) {
        redirect("/login");
    }

    const { user, fullName, role } = data;

    // The Dispatcher Logic
    // We convert to lowercase to ensure it matches regardless of database casing
    switch (role?.toLowerCase()) {
        case "student":
            return <StudentDashboard fullName={fullName} />;
        
        case "staff":
            return <StaffDashboard fullName={fullName} />;
        
        case "manager":
        case "line_manager":
            return <ManagerDashboard fullName={fullName} />;
        
        case "admin":
            return <AdminDashboard fullName={fullName} />;
        
        case "external":
        case "guest":
            return <GuestDashboard fullName={fullName} />;

        default:
            // Fallback for unexpected roles
            return (
                <div className="p-10 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Access Error</h1>
                    <p className="text-gray-500">The role "{role}" does not have a dashboard assigned. Please contact IT support.</p>
                </div>
            );
    }
}