// components/dashboard/ManagerDashboard.tsx
export default function ManagerDashboard({ fullName }: { fullName: string }) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#0D284A]">Manager Approval Portal</h1>
        <p className="text-gray-500">Review and authorize department printing</p>
      </header>

      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center gap-3">
        <span className="text-xl">🔔</span>
        <p className="text-sm text-orange-700 font-medium">You have <strong>3</strong> requests awaiting your digital signature.</p>
      </div>

      {/* Req 2: Approvals Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-[#0D284A]">Pending Approvals</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {/* Example Item */}
          <div className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-bold text-[#0D284A]">Order #882 - Final Exam Papers</p>
              <p className="text-xs text-gray-400">Requested by: Dr. Sarah Ahmed • Department: IT</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold">Approve</button>
              <button className="px-4 py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold">Reject</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}