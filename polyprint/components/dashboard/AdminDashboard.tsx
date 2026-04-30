// components/dashboard/AdminDashboard.tsx
export default function AdminDashboard({ fullName }: { fullName: string }) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-[#0D284A]">System Administration</h1>
        <p className="text-gray-500">Analytics & Audit Oversight</p>
      </header>

      {/* Req 4: Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0D284A] text-white p-6 rounded-2xl">
          <h3 className="text-xs font-bold opacity-70 uppercase">Total Requests</h3>
          <p className="text-3xl font-black">1,240</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase">Approval Rate</h3>
          <p className="text-3xl font-black text-green-500">94%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase">Paper Usage</h3>
          <p className="text-3xl font-black text-[#0D284A]">15.2k</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase">Active Users</h3>
          <p className="text-3xl font-black text-[#3CCFD0]">45</p>
        </div>
      </div>

      {/* Req 12: Audit Log */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-[#0D284A]">Tamper-Evident Audit Logs</h2>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">SECURE</span>
        </div>
        <div className="p-6 text-sm text-gray-500">
           {/* You will map your Supabase logs here */}
           <p className="italic">Monitoring system transactions in real-time...</p>
        </div>
      </div>
    </div>
  );
}