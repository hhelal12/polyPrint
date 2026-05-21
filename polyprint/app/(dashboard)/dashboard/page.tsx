import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getPendingOrdersForManager, getPendingCount } from "@/lib/orders/order";

import StudentDashboard from "@/components/dashboard/StudentDashboard";
import ManagerDashboard from "@/components/dashboard/ManagerDashboard";

interface DashboardProps {
  searchParams: Promise<{ page?: string; [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: DashboardProps) {
  const data = await getCurrentUser();

  if (!data) {
    redirect("/login");
  }

  const { fullName, role } = data;

  // Explicitly unwrap searchParams before evaluating attributes
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 0;

  switch (role?.toLowerCase()) {
    case "student":
      return <StudentDashboard fullName={fullName} />;
    
    case "manager":
    case "staff":
    case "line_manager": {
      // Adjusted default page metrics sizing threshold down to match component constraints
      const result = await getPendingOrdersForManager(currentPage, 5);
      const pendingCount = await getPendingCount();

      return (
        <ManagerDashboard 
          fullName={fullName} 
          orders={result.data || []} 
          pendingCount={pendingCount}
          totalCount={result.totalCount || 0}
          currentPage={currentPage}
        />
      );
    }
    
    default:
      return (
        <div className="p-10 text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Error</h1>
          <p className="text-gray-500">The role "{role}" is not configured.</p>
        </div>
      );
  }
}