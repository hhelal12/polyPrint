import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export default async function DashboardPage() {
    const data = await getCurrentUser();

    if (!data) {
        redirect("/login");
    }

    const { user, fullName, role } = data;

    return (
        <>
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#0D284A]">
                    Welcome back, {fullName}!
                </h1>
                <p className="text-gray-500">
                    Manage your printing orders and account details as a <span className="font-semibold text-[#3CCFD0]">{role}</span>.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                
                {/* Card 1: Account Info */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-[#0D284A] mb-4">Account Status</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Role:</span>
                            <span className="font-semibold text-[#0A4F8B] capitalize">{role}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Email:</span>
                            <span className="font-medium">{user.email}</span>
                        </div>
                    </div>
                </div>

                {/* Card 2: Quick Actions */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 md:col-span-2">
                    <h2 className="text-lg font-bold text-[#0D284A] mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 bg-[#0A4F8B] text-white p-4 rounded-xl font-bold hover:bg-[#0D284A] transition-all active:scale-95">
                            + New Print Order
                        </button>
                        <button className="flex items-center justify-center gap-2 border-2 border-gray-100 text-[#0D284A] p-4 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95">
                            View History
                        </button>
                    </div>
                </div>

                {/* Card 3: Recent Activity */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 md:col-span-3">
                    <h2 className="text-lg font-bold text-[#0D284A] mb-4">Recent Activity</h2>
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-gray-400 text-sm">No recent orders found.</p>
                    </div>
                </div>
                
            </div>
        </>
    );
}