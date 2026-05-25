"use client";

import { useEffect, useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { getDetailedManagerAnalytics } from "@/lib/analysis/manger";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// 🎨 Expanded theme to add variety while keeping your brand identity
const THEME = ['#0891b2', '#0f172a', '#d97706', '#0d9488'];

export default function AnalysisPage() {
  const [data, setData] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => { getDetailedManagerAnalytics().then(setData); }, []);

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current);
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, 190, 0);
    pdf.save("PolyPrint_Report.pdf");
  };

  if (!data) return <div className="p-10">Loading analytics...</div>;

  return (
    <div className="p-8 space-y-6">
      <button onClick={downloadPDF} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition">
        Download PDF Report
      </button>

      <div ref={reportRef} className="bg-white p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Status Pie */}
        <div className="h-64 border p-4 rounded-xl">
          <h2 className="font-bold mb-2">Orders by Status</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={Object.entries(data.statusCounts).map(([name, value]) => ({name, value}))} dataKey="value">
                {Object.entries(data.statusCounts).map((_, i) => <Cell key={i} fill={THEME[i % THEME.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Line - Domain set to 'auto' to ensure 0 is always visible */}
        <div className="h-64 border p-4 rounded-xl">
          <h2 className="font-bold mb-2">Orders Per Month</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={Object.entries(data.monthlyOrders).map(([name, value]) => ({name, value}))}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 'auto']} /> 
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={THEME[0]} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feedback Bar - Domain [0, 5] keeps the scale professional */}
        <div className="h-64 border p-4 rounded-xl">
          <h2 className="font-bold mb-2">Feedback Ratings</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Object.entries(data.feedbackRatings).map(([name, value]) => ({name, value}))}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="value">
                {Object.entries(data.feedbackRatings).map((_, i) => <Cell key={i} fill={THEME[i % THEME.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Services Bar - Domain [0, 20] ensures a clean look */}
        <div className="h-64 border p-4 rounded-xl">
          <h2 className="font-bold mb-2">Most Requested Services</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={Object.entries(data.servicePopularity).map(([name, value]) => ({name, value}))}>
              <XAxis type="number" domain={[0, 20]} />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="value">
                {Object.entries(data.servicePopularity).map((_, i) => <Cell key={i} fill={THEME[i % THEME.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}