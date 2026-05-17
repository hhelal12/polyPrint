"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean | null;
  created_at: string;
}

interface NotificationBellProps {
  currentUserId: string;
}

export default function NotificationBell({ currentUserId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // 1. Fetch existing unread or recent notifications on mount
  useEffect(() => {
    if (!currentUserId) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setNotifications(data);
      }
    };

    fetchNotifications();
  }, [currentUserId, supabase]);

  // 2. Listen to Real-Time INSERT events to catch notifications instantly
  useEffect(() => {
    if (!currentUserId) {
      console.log("⚠️ Realtime blocked: Missing currentUserId inside NotificationBell.");
      return;
    }

    console.log(`📡 Opening Realtime channel connection for user_id: ${currentUserId}`);

    const channel = supabase
      .channel(`navbar-notifications-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          console.log("🔥 New real-time notification captured!", payload);
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev.slice(0, 9)]);
        }
      )
      .subscribe((status) => {
        console.log(`🔌 Subscription status for channel navbar-notifications-${currentUserId}:`, status);
        if (status === "CHANNEL_ERROR") {
          console.error(" Realtime connection failed. Check your Supabase RLS policies or Dashboard Realtime toggle.");
        }
      });

    return () => {
      console.log(`🔌 Disconnecting Realtime channel for user: ${currentUserId}`);
      supabase.removeChannel(channel);
    };
  }, [currentUserId, supabase]);

  // Mark all notifications as read when the user closes the dropdown
  useEffect(() => {
    const handleClickOutside = async (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);

        if (unreadCount > 0) {
          setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
          
          await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", currentUserId)
            .eq("is_read", false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, unreadCount, currentUserId, supabase]);

  // 4. Handle Deleting a single notification row
  const handleRemoveNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 

    setNotifications((prev) => prev.filter((n) => n.id !== id));

    // Delete directly from the Supabase database
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUserId); // Guard rule validation alignment

    if (error) {
      console.error(" Failed to remove notification from DB:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-[#3CCFD0] transition-colors rounded-full hover:bg-gray-100 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-100 bg-white shadow-lg ring-1 ring-black/5 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-[#0D284A]">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-gray-50/80 transition-colors text-left flex items-start gap-3 relative group ${
                    !notif.is_read ? "bg-blue-50/20 font-medium" : ""
                  }`}
                >
                  <div className="flex-1 flex flex-col gap-1 pr-6">
                    <p className="text-xs font-bold text-gray-800 flex items-center justify-between">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(notif.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="absolute right-3 top-4 flex flex-col items-center gap-2">
                    {!notif.is_read && (
                      <span className="h-1.5 w-1.5 bg-blue-500 rounded-full group-hover:hidden" />
                    )}
                    
                    <button
                      onClick={(e) => handleRemoveNotification(notif.id, e)}
                      className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete notification"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-400 font-medium">
                Your notification inbox is clean! 🌟
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}