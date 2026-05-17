import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getPendingOrdersForManager, getPendingCount } from "@/lib/orders/order";

import StudentDashboard from "@/components/dashboard/StudentDashboard";
import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
// Import other dashboards as needed...

// Define the correct Next.js 15 type parameters where searchParams is a Promise
interface DashboardProps {
  searchParams: Promise<{ page?: string; [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: DashboardProps) {
    const data = await getCurrentUser();

    if (!data) {
        redirect("/login");
    }

    const { fullName, role } = data;

    // Explicitly unwrap searchParams before accessing its attributes
    const resolvedParams = await searchParams;
    const currentPage = Number(resolvedParams?.page) || 0;

    switch (role?.toLowerCase()) {
        case "student":
            return <StudentDashboard fullName={fullName} />;
        
        // Combined operations to process administrative screens correctly
        case "manager":
        case "staff":
        case "line_manager":
            // Fetch layout metrics using the unpacked configuration variables
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