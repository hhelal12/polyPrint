"use client";

import { useEffect } from "react";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: "success" | "error" | "info";
}

export default function Popup({ isOpen, onClose, title, message, variant = "success" }: PopupProps) {
  // Close modal on 'Escape' keypress
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Dynamic Theme Styling based on variant
  const styles = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      iconColor: "text-emerald-500",
      btnBg: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
      icon: "✨",
    },
    error: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      iconColor: "text-rose-500",
      btnBg: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500",
      icon: "🛑",
    },
    info: {
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      iconColor: "text-cyan-500",
      btnBg: "bg-[#0D284A] hover:bg-slate-800 focus:ring-slate-900",
      icon: "ℹ️",
    },
  };

  const currentStyle = styles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Backdrop blur filter */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Box Container Card */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-xl border border-slate-100 transition-all scale-100 animate-in zoom-in-95 duration-200">
        
        {/* Dynamic Theme Icon badge representation */}
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${currentStyle.bg} border ${currentStyle.border} text-2xl mb-4`}>
          {currentStyle.icon}
        </div>

        {/* Text Segment */}
        <h3 className="text-lg font-black text-slate-900 tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          {message}
        </p>

        {/* Bottom Interactive Button Stack */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentStyle.btnBg}`}
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}