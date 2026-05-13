import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getPendingOrdersForManager, getPendingCount } from "@/lib/orders/order";

import StudentDashboard from "@/components/dashboard/StudentDashboard";
import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
// Import other dashboards as needed...

export default async function DashboardPage({ 
    searchParams 
}: { 
    searchParams: { page?: string } 
}) {
    const data = await getCurrentUser();

    if (!data) {
        redirect("/login");
    }

    const { fullName, role } = data;
    const currentPage = Number(searchParams?.page) || 0;

    switch (role?.toLowerCase()) {
        case "student":
            return <StudentDashboard fullName={fullName} />;
        
        case "manager":
        case "staff":
            return <StudentDashboard fullName={fullName} />;
        case "line_manager":
            // Fetch fresh data
            const result = await getPendingOrdersForManager(currentPage, 5);
            const pendingCount = await getPendingCount();

            return (
                <ManagerDashboard 
                    fullName={fullName} 
                    orders={result.data} // result.data is guaranteed to be an array now
                    pendingCount={pendingCount}
                    totalCount={result.totalCount}
                    currentPage={currentPage}
                />
            );
        
        default:
            return (
                <div className="p-10 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Access Error</h1>
                    <p className="text-gray-500">The role "{role}" is not configured.</p>
                </div>
            );
    }
}