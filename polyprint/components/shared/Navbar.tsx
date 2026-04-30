// components/shared/Navbar.tsx
import Link from 'next/link';
import Image from 'next/image';
import LogoutBut from './logoutBut';
import SessionGuard from '../../lib/auth/SessionGuard';
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export default async function Navbar() {
  const data = await getCurrentUser();

  if (!data) return null; 

  const { fullName, role } = data;

  // Standardize role to lowercase to match the config keys
  const userRoleKey = role?.toLowerCase() as keyof typeof ROLE_NAV_CONFIG;

  const initials = fullName
    .split(/[ ._]/)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const ROLE_NAV_CONFIG = {
    student: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "New Order", href: "/orders/new" }, 
      { label: "My Order", href: "/orders" },  
      { label: "Support", href: "/support" },
      { label: "My Feedback", href: "/feedback" } 
    ],
    staff: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Manage Order", href: "/orders/manage" },
      { label: "Material Order", href: "/orders/material" },
      { label: "Help", href: "/help" }
    ],
    manager: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Approvals", href: "/approvals" } 
    ],
    admin: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Analytics", href: "/analytics" }, 
      { label: "User Management", href: "/users" },
      { label: "Audit Logs", href: "/audit-logs" }
    ],
    external: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "New Order", href: "/orders/new" },
      { label: "My Order", href: "/orders" }
    ]
  };

  // Get the links for the current role, fallback to empty array if role not found
  const navLinks = ROLE_NAV_CONFIG[userRoleKey] || [];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <SessionGuard />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        
        {/* Logo Area */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <Image 
            src="/logo.svg" 
            alt="PolyPrint Logo" 
            width={35} 
            height={35} 
            priority 
          />
          <span className="text-xl font-extrabold text-[#0D284A] tracking-tight">
            Poly<span className="text-[#3CCFD0]">Print</span>
          </span>
        </Link>

        {/* Dynamic Navigation Links Based on Role */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
          {navLinks.map((link) => (
            <Link 
              key={link.label} 
              href={link.href} 
              className="hover:text-[#3CCFD0] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-[#0D284A] leading-none">
              {fullName}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3CCFD0] mt-1">
              {role}
            </span>
          </div>

          <div className="h-10 w-10 rounded-full bg-[#3CCFD0]/10 border-2 border-[#3CCFD0] flex items-center justify-center text-[#0D284A] font-bold text-sm shadow-inner">
            {initials}
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          <LogoutBut />
        </div>
      </div>
    </nav>
  );
}