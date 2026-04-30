// components/dashboard/StudentDashboard.tsx
import Link from 'next/link';

export default function StudentDashboard({ fullName }: { fullName: string }) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#0D284A]">Student Portal</h1>
          <p className="text-gray-500">Welcome back, {fullName}</p>
        </div>
        <Link href="/orders/new" className="bg-[#3CCFD0] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#2bb1b2] transition-all">
          + New Print Request
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Requirement 9: Real-time tracking stats */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase">Active Orders</h3>
          <p className="text-3xl font-black text-[#0D284A]">2</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase">Ready for Pickup</h3>
          <p className="text-3xl font-black text-[#3CCFD0]">1</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-[#0D284A] mb-4">Recent Order History</h2>
        <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
          Your past orders will appear here.
        </div>
      </div>
    </div>
  );
}