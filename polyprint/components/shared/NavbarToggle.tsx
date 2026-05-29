"use client";
import { useState } from "react";

export default function NavbarToggle({ links }: { links: { label: string; href: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="md:hidden p-2 text-[#0D284A]" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg flex flex-col p-4 md:hidden z-40">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="py-3 font-semibold text-gray-600 border-b border-gray-50">
              {link.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}