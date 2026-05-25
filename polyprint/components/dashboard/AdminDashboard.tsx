"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { getAdminDashboardData } from "@/lib/analysis/admin";
import { generateAndUploadAuditLog } from "@/lib/audit/audit";
import { KPICard } from "@/components/ui/card";
import Popup from "@/components/ui/Popup"; // Ensure this import path is correct

// Defined color palette for consistent branding
const COLORS = ['#0891b2', '#0f172a', '#d97706', '#0d9488', '#64748b'];

interface AdminDashboardProps {
  fullName: string;
}

export default function AdminDashboard({ fullName }: AdminDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for the Popup
  const [popup, setPopup] = useState<{
    isOpen: boolean; title: string; message: string; variant: "success" | "error" | "info";
  }>({ isOpen: false, title: "", message: "", variant: "info" });

  useEffect(() => {
    getAdminDashboardData().then(setData);
  }, []);

  const downloadLogFile = async () => {
    setIsGenerating(true);
    try {
      const url = await generateAndUploadAuditLog();

      // 1. Fetch the file as a Blob to force download
      const response = await fetch(url, { cache: 'no-store' });
      const blob = await response.blob();

      // 2. Create a temporary download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `system_audit_${new Date().toISOString().split('T')[0]}.log`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      console.error("Log Generation Failed:", e);
      // Trigger the custom Popup instead of alert
      setPopup({ 
        isOpen: true, 
        title: "Download Failed", 
        message: "Failed to generate system log. Please try again later.", 
        variant: "error" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!data) return <div className="p-8">Loading System Analytics...</div>;

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <header>
        <h1 className="text-3xl font-bold text-[#0D284A]">Welcome, {fullName}</h1>
        <p className="text-gray-500">System Administration & Analytics Overview</p>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Total Orders" value={data.kpi.totalOrders} color="bg-cyan-600" />
        <KPICard title="Pending" value={data.kpi.pending} color="bg-slate-900" />
        <KPICard title="Completed" value={data.kpi.completed} color="bg-teal-600" />
        <KPICard title="Revenue (BHD)" value={data.kpi.totalRevenue.toFixed(2)} color="bg-amber-600" />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow border">
          <h2 className="font-bold mb-4 text-slate-700">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(data.statusCounts).map(([name, value]) => ({ name, value }))}
                dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={5}
              >
                {Object.entries(data.statusCounts).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* User Roles Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow border">
          <h2 className="font-bold mb-4 text-slate-700">User Roles Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(data.roleCounts).map(([name, value]) => ({ name, value }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0891b2" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Audit Control */}
      <div className="bg-white p-6 rounded-2xl shadow border flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg text-slate-800">System Audit Oversight</h2>
          <p className="text-gray-500 text-sm">Download the complete platform activity audit in standard .log format.</p>
        </div>
        <button
          onClick={downloadLogFile}
          disabled={isGenerating}
          className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50"
        >
          {isGenerating ? "Processing..." : "Download System Log (.log)"}
        </button>
      </div>

      {/* Popup Component */}
      <Popup
        isOpen={popup.isOpen}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        onClose={() => setPopup(p => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}