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

  const statusData = Object.entries(data.statusCounts || {}).map(([name, value]) => ({ name, value }));
  const monthlyData = Object.entries(data.monthlyOrders || {}).map(([name, value]) => ({ name, value }));
  const feedbackData = Object.entries(data.feedbackRatings || {}).map(([name, value]) => ({ name, value }));
  const serviceData = Object.entries(data.servicePopularity || {}).map(([name, value]) => ({ name, value }));

  const renderLegend = () => (
    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px", paddingTop: "10px" }}>
      {statusData.map((entry, index) => (
        <span
          key={entry.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "10px",
            fontWeight: 600,
            color: "#475569",
          }}
        >
          <svg width="6" height="6" viewBox="0 0 6 6">
            <circle cx="3" cy="3" r="3" fill={THEME[index % THEME.length]} />
          </svg>
          {entry.name}
        </span>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "32px" }}>
      <div style={{ maxWidth: "1024px", margin: "0 auto" }}>

        {/* ── Dashboard Header ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Analytics Report
            </h1>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>
              PolyPrint Copy Centre — Manager Dashboard
            </p>
          </div>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            style={{
              backgroundColor: "#0f172a",
              color: "#ffffff",
              padding: "10px 20px",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "13px",
              border: "none",
              cursor: downloading ? "not-allowed" : "pointer",
              opacity: downloading ? 0.6 : 1,
            }}
          >
            {downloading ? "Generating PDF..." : "⬇ Download PDF"}
          </button>
        </div>

        {/* ── Charts Grid ── */}
        <div
          ref={reportRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
            backgroundColor: "#f8fafc",
            padding: "4px",
          }}
        >
          {/* Orders by Status — Pie */}
          <ChartCard title="Orders by Status">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  cx="50%"
                  cy="42%"
                  outerRadius="60%"
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  style={{ fontSize: "9px", fontWeight: "600", fill: "#475569" }}
                >
                  {statusData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={THEME[index % THEME.length]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Legend content={renderLegend} />
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
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={THEME[0]}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: THEME[0], strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
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