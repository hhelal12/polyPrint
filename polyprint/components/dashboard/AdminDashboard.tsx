"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { getAdminDashboardData } from "@/lib/analysis/admin";
import { generateAndUploadAuditLog } from "@/lib/audit/audit";
import { KPICard } from "@/components/ui/card";
import Popup from "@/components/ui/Popup"; // 1. Import your Popup component

const COLORS = ['#0891b2', '#0f172a', '#d97706', '#0d9488', '#64748b'];

interface AdminDashboardProps {
  fullName: string;
}

export default function AdminDashboard({ fullName }: AdminDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 2. Add state for the Popup
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
      const response = await fetch(url, { cache: 'no-store' });
      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `system_audit_${new Date().toISOString().split('T')[0]}.log`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
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
      {/* ... (Existing Header, KPI, and Chart sections remain unchanged) ... */}
      
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

      {/* 4. Render the Popup component */}
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