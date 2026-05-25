import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getStaffDashboardStats } from "@/lib/orders/staffDash"; 
// 1. Import the student stats fetcher
import { getStudentDashboardStats } from "@/lib/orders/studentDash"; 
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import StaffDashboard from "@/components/dashboard/StaffDashboard";
import { getPendingOrdersForManager, getPendingCount } from "@/lib/orders/order";

interface DashboardProps {
  searchParams: Promise<{ page?: string; [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: DashboardProps) {
  const data = await getCurrentUser();

  if (!data) {
    redirect("/login");
  }

  const userId = data.user?.id;
  const { fullName, role } = data;

  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 0;

  switch (role?.toLowerCase()) {
    case "student": {
      // 2. Fetch and pass the stats
      if (!userId) return null;
      const stats = await getStudentDashboardStats(userId);
      return <StudentDashboard fullName={fullName} stats={stats} />;
    }
    
    case "manager":
    case "admin":
      return <AdminDashboard fullName={fullName} />;

    case "staff": {
      if (!userId) return null;
      const stats = await getStaffDashboardStats(userId);
      
      return (
        <StaffDashboard 
          fullName={fullName} 
          stats={stats} 
        />
      );
    }

    case "line_manager": {
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