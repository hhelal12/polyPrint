"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { useManagerAnalytics } from "@/lib/hooks/useManagerAnalytics";
import ChartCard from "@/components/ui/ChartCard";

const THEME = ["#0891b2", "#0f172a", "#d97706", "#0d9488"];

export default function AnalysisPage() {
  const { data, downloading, reportRef, downloadPDF } = useManagerAnalytics();

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-500 text-xs font-medium gap-2">
        <span className="animate-spin text-sm">⏳</span> Loading analytics profiles...
      </div>
    );
  }

  // Parse structured state properties securely
  const statusData   = Object.entries(data.statusCounts || {}).map(([name, value]) => ({ name, value }));
  const monthlyData  = Object.entries(data.monthlyOrders || {}).map(([name, value]) => ({ name, value }));
  const feedbackData = Object.entries(data.feedbackRatings || {}).map(([name, value]) => ({ name, value }));
  const serviceData  = Object.entries(data.servicePopularity || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Dashboard Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 sm:pb-0 sm:border-none">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Analytics Report
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">
              PolyPrint Copy Centre — Manager Dashboard
            </p>
          </div>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="w-full sm:w-auto bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98] shrink-0"
          >
            {downloading ? "Generating PDF..." : "⬇ Download PDF"}
          </button>
        </header>

        {/* ── Master Charts Content Grid ── */}
        <div 
          ref={reportRef} 
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-transparent"
        >
          {/* Orders by Status — Pie */}
          <ChartCard title="Orders by Status">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  cx="50%"
                  cy="45%"
                  outerRadius="65%"
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  style={{ fontSize: "10px", fontWeight: "600", fill: "#475569" }}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={THEME[i % THEME.length]} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Legend
                  iconSize={6}
                  iconType="circle"
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: "10px", fontWeight: "600", paddingTop: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Orders Per Month — Line */}
          <ChartCard title="Orders Per Month">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "500" }} tickLine={false} />
                <YAxis domain={[0, "auto"]} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "500" }} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="value" stroke={THEME[0]} strokeWidth={2.5} dot={{ r: 3, fill: THEME[0], strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Feedback Ratings — Bar */}
          <ChartCard title="Feedback Ratings">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feedbackData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "500" }} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "500" }} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {feedbackData.map((_, i) => (
                    <Cell key={i} fill={THEME[i % THEME.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Most Requested Services — Horizontal Bar */}
          <ChartCard title="Most Requested Services">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={serviceData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <XAxis type="number" domain={[0, "auto"]} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "500" }} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "#64748b", fontWeight: "600" }} width={65} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {serviceData.map((_, i) => (
                    <Cell key={i} fill={THEME[i % THEME.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>
      </div>
    </div>
  );
}