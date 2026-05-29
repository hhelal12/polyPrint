import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { updateOrderStatusAction } from "@/lib/orders/staffOrder";

export interface OrderItem {
  id?: string;
  file_url: string;
  service_type: string | null;
  quantity: number | null;
  paper_size: string | null;
  color_mode: string | null;
  print_sides: string | null;
}

export interface Order {
  id: string;
  status: string | null;
  order_name: string | null;
  total_price?: number | string | null;
  manager_notes: string | null;
  created_at: string | null;
  requester?: { full_name: string | null } | null;
  order_items: OrderItem[];
}

export type PopupState = {
  isOpen: boolean;
  title: string;
  message: string;
  variant: "success" | "error" | "info";
  onConfirm?: () => void;
};

export function useManageOrders(initialOrders: Order[]) {
  const supabase = createClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [colorFilter, setColorFilter] = useState("all");
  const [sidesFilter, setSidesFilter] = useState("all");
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false, title: "", message: "", variant: "info",
  });

  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      const searchTarget = (
        (order.order_name || "") + " " +
        (order.id || "") + " " +
        (order.requester?.full_name || "")
      ).toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());

      const item = order.order_items?.[0];
      const itemColorMode =
        item?.color_mode?.toLowerCase() === "full_color" || item?.color_mode?.toLowerCase() === "color"
          ? "full_color" : "black_white";
      const itemPrintSides =
        item?.print_sides?.toLowerCase() === "double-sided" || item?.print_sides?.toLowerCase() === "double_sided"
          ? "double_sided" : "one_sided";

      return matchesSearch &&
        (colorFilter === "all" || itemColorMode === colorFilter) &&
        (sidesFilter === "all" || itemPrintSides === sidesFilter);
    });
  }, [initialOrders, searchQuery, colorFilter, sidesFilter]);

  const handleDownload = async (order: Order) => {
    const fileUrl = order.order_items?.[0]?.file_url;
    if (!fileUrl) {
      setPopup({ isOpen: true, title: "Error", message: "No file found for this order.", variant: "error" });
      return;
    }
    try {
      const { data, error } = await supabase.storage.from("print-files").createSignedUrl(fileUrl, 300);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch {
      setPopup({ isOpen: true, title: "Download Failed", message: "Could not retrieve file.", variant: "error" });
    }
  };

  const handleStatusUpdate = (orderId: string, nextStatus: "in_progress" | "completed") => {
    setPopup({
      isOpen: true,
      title: "Confirm Status Update",
      message: `Mark this order as ${nextStatus.replace("_", " ")}?`,
      variant: "info",
      onConfirm: async () => {
        setLoadingId(orderId);
        try {
          await updateOrderStatusAction(orderId, nextStatus);
          setPopup({ isOpen: true, title: "Success", message: "Order updated successfully.", variant: "success" });
        } catch {
          setPopup({ isOpen: true, title: "Update Failed", message: "Problem updating the order.", variant: "error" });
        } finally {
          setLoadingId(null);
        }
      },
    });
  };

  const closePopup = () => setPopup((p) => ({ ...p, isOpen: false }));

  return {
    loadingId, popup, closePopup,
    searchQuery, setSearchQuery,
    colorFilter, setColorFilter,
    sidesFilter, setSidesFilter,
    filteredOrders, initialOrders,
    handleDownload, handleStatusUpdate,
  };
}