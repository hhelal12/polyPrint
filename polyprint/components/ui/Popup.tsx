"use client";

import { useEffect } from "react";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
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
    // 'fixed inset-0' handles full-screen overlay. 
    // 'p-4' ensures the popup doesn't touch the edges of a phone screen.
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* 'max-w-md' and 'w-full' ensure it looks good on both mobile and desktop */}
      <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${currentStyle.bg} border ${currentStyle.border} text-3xl mb-4`}>
          {currentStyle.icon}
        </div>
        
        <h3 className="text-xl font-black text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>

        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
          {onConfirm && (
            <button 
              onClick={() => { onConfirm(); onClose(); }} 
              className={`w-full rounded-2xl px-6 py-3 text-sm font-bold text-white ${currentStyle.btnBg} transition-all active:scale-[0.98]`}
            >
              Confirm
            </button>
          )}
          <button
            onClick={onClose}
            className={`w-full rounded-2xl px-6 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
              onConfirm ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : `text-white ${currentStyle.btnBg}`
            }`}
          >
            {onConfirm ? "Cancel" : "Acknowledge"}
          </button>
        </div>
      </div>
    </div>
  );
}