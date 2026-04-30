// components/dashboard/StaffDashboard.tsx
export default function StaffDashboard({ fullName }: { fullName: string }) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#0D284A]">Staff Dashboard</h1>
        <p className="text-gray-500">Departmental Print Management</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button className="p-8 bg-white border-2 border-gray-50 rounded-2xl shadow-sm hover:border-[#3CCFD0] text-left transition-all">
          <span className="text-3xl mb-2 block">📄</span>
          <h3 className="font-bold text-[#0D284A]">Manage Existing Orders</h3>
          <p className="text-sm text-gray-400">Track and update your department requests.</p>
        </button>
        <button className="p-8 bg-white border-2 border-gray-50 rounded-2xl shadow-sm hover:border-[#3CCFD0] text-left transition-all">
          <span className="text-3xl mb-2 block">📦</span>
          <h3 className="font-bold text-[#0D284A]">Material Order</h3>
          <p className="text-sm text-gray-400">Request paper, ink, or specialized stationery.</p>
        </button>
      </div>
    </div>
  );
}