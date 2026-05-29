"use client";

import { useEffect, useState } from "react";
import { getMyOrders } from "@/lib/orders/order";
import Link from "next/link";
import OrderFilters from "@/components/orders/OrderFilters";

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [colorFilter, setColorFilter] = useState("all");
  const [sidesFilter, setSidesFilter] = useState("all");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error: fetchError } = await getMyOrders();
        if (fetchError) {
          setError(fetchError);
        } else if (data) {
          setOrders(data);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, maxPrice, colorFilter, sidesFilter]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-10 text-center text-slate-500 text-sm font-medium">
        Loading your print orders... ⏳
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-10">
        <div className="p-6 text-red-500 bg-red-50 rounded-xl border border-red-100 text-sm">
          Error loading orders: {error}
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order: any) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const searchTarget = (order.order_name || "").toLowerCase() + " " + (order.description || "").toLowerCase();
    const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
    const finalPrice = Number(order.total_price) || 0;
    const matchesPrice = finalPrice <= maxPrice;
    const orderItem = order.order_items?.[0];
    const itemColorMode =
      orderItem?.color_mode?.toLowerCase() === "full_color" || orderItem?.color_mode?.toLowerCase() === "color"
        ? "full_color"
        : "black_white";
    const itemPrintSides =
      orderItem?.print_sides?.toLowerCase() === "double-sided" || orderItem?.print_sides?.toLowerCase() === "double_sided"
        ? "double_sided"
        : "one_sided";
    const matchesColor = colorFilter === "all" || itemColorMode === colorFilter;
    const matchesSides = sidesFilter === "all" || itemPrintSides === sidesFilter;
    return matchesStatus && matchesSearch && matchesPrice && matchesColor && matchesSides;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPageItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-10">

      {/* ── Header ── */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Print Orders</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track your CDOFS requests and approval status.</p>
        </div>
        <Link
          href="/orders/new"
          className="w-full sm:w-auto text-center bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-sm text-sm"
        >
          + New Request
        </Link>
      </header>

      {/* ── Filters ── */}
      <OrderFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        colorFilter={colorFilter}
        setColorFilter={setColorFilter}
        sidesFilter={sidesFilter}
        setSidesFilter={setSidesFilter}
      />

      {/* ── Empty State ── */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-slate-800">No matching orders</h3>
          <p className="text-slate-500 mt-2 text-sm">Adjust your filtering constraints or query terms.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:gap-6">
            {currentPageItems.map((order: any) => {
              const feedbackItem = Array.isArray(order.feedback) ? order.feedback[0] : order.feedback;
              const hasFeedback = order.status === "completed" && feedbackItem;

              return (
                <div
                  key={order.id}
                  className="bg-white border border-slate-100 p-4 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
                >
                  {/* ── Card Top Row ── */}
                  <div className="flex flex-col gap-4">

                    {/* Order ID + Status badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyles(order.status)}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </div>

                    {/* Main content + price block */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                      {/* Left — title, description, tags */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight truncate">
                          {order.order_name || "Untitled Request"}
                        </h3>

                        {order.description && (
                          <p className="text-slate-600 text-sm mt-1 mb-3 line-clamp-2 italic">
                            "{order.description}"
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 items-center mt-2">
                          <span className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded font-medium whitespace-nowrap">
                            {order.order_items?.[0]?.service_type || "Printing Service"}
                          </span>
                          <p className="text-xs text-slate-500 leading-snug">
                            {order.order_items?.[0]?.paper_size} •{" "}
                            {order.order_items?.[0]?.color_mode?.replace("_", " ")} •{" "}
                            {order.order_items?.[0]?.print_sides} • Qty:{" "}
                            {order.order_items?.[0]?.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Right — date + price */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-4 shrink-0 sm:pt-1">
                        <div className="text-left sm:text-right">
                          <span className="text-sm font-semibold text-slate-700 block">
                            {new Date(order.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-xs text-slate-400 mt-0.5 block">
                            {new Date(order.created_at).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-right">
                          <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block mb-0.5">
                            Total Price
                          </span>
                          <span className="text-sm font-bold text-cyan-600 font-mono">
                            BHD {(Number(order.total_price) || 0).toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Feedback Block ── */}
                  {hasFeedback && (
                    <div className="pt-4 border-t border-dashed border-slate-100 flex flex-col gap-1.5 bg-amber-50/20 p-3 rounded-xl border border-amber-500/5">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs font-bold text-slate-700 mr-1">Your Rating:</span>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span
                            key={index}
                            className={`text-sm ${index < (feedbackItem.rating || 0) ? "text-amber-400" : "text-slate-200"}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {feedbackItem.comments && (
                        <p className="text-xs text-slate-600 italic leading-relaxed">
                          "{feedbackItem.comments}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-4 gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                // On mobile show only nearby pages to avoid overflow
                const isNearCurrent = Math.abs(pageNumber - currentPage) <= 1 || pageNumber === 1 || pageNumber === totalPages;
                if (!isNearCurrent) {
                  // Show ellipsis once per gap
                  if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                    return (
                      <span key={pageNumber} className="text-slate-400 text-xs px-1">…</span>
                    );
                  }
                  return null;
                }
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      currentPage === pageNumber
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusStyles(status: string) {
  switch (status) {
    case "pending_approval":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "approved":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "completed":
      return "bg-green-50 text-green-700 border border-green-200";
    case "rejected":
      return "bg-red-50 text-red-700 border border-red-200";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200";
  }
}