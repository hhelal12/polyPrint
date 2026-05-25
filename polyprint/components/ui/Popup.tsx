"use client";

import { useEffect } from "react";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void; // Added for confirmation logic
  title: string;
  message: string;
  variant?: "success" | "error" | "info";
}

export default function Popup({ isOpen, onClose, onConfirm, title, message, variant = "success" }: PopupProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const styles = {
    success: { bg: "bg-emerald-50", border: "border-emerald-200", btnBg: "bg-emerald-600 hover:bg-emerald-700", icon: "✨" },
    error: { bg: "bg-rose-50", border: "border-rose-200", btnBg: "bg-rose-600 hover:bg-rose-700", icon: "🛑" },
    info: { bg: "bg-cyan-50", border: "border-cyan-200", btnBg: "bg-[#0D284A] hover:bg-slate-800", icon: "ℹ️" },
  };

  const currentStyle = styles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl border border-slate-100">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${currentStyle.bg} border ${currentStyle.border} text-2xl mb-4`}>
          {currentStyle.icon}
        </div>
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        <p className="mt-2 text-xs text-slate-500">{message}</p>

        <div className="mt-6 flex gap-3">
          {onConfirm && (
            <button 
              onClick={() => { onConfirm(); onClose(); }} 
              className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-bold text-white ${currentStyle.btnBg}`}
            >
              Confirm
            </button>
          )}
          <button
            onClick={onClose}
            className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-bold ${onConfirm ? "bg-slate-100 text-slate-600" : `text-white ${currentStyle.btnBg}`}`}
          >
            {onConfirm ? "Cancel" : "Acknowledge"}
          </button>
        </div>
      </div>
    </div>
  );
}