import Link from 'next/link';
import Image from 'next/image';
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import LogoutBut from './logoutBut';
import SessionGuard from '../../lib/auth/SessionGuard';

export default async function Navbar() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Use getUser() for security to ensure metadata is fresh
  const { data: { user } } = await supabase.auth.getUser();
  
  // 1. Extract Role and Name with fallbacks for manual Auth users
  const role = user?.user_metadata?.role || "Student";
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  
  // 2. Generate Initials (e.g., "Ali Jaffar" -> "AJ" or "202201389" -> "2")
  const initials = fullName
    .split(/[ ._]/)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      {/* 15-minute Auto-Logout Logic */}
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

        {/* Navigation Links - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
          <Link href="/dashboard" className="hover:text-[#3CCFD0] transition-colors">
            Dashboard
          </Link>
          <Link href="/orders/new" className="hover:text-[#3CCFD0] transition-colors">
            New Order
          </Link>
          {/* Admin/Staff Only Link */}
          {(role === 'Admin' || role === 'Staff') && (
            <Link href="/inventory" className="hover:text-[#3CCFD0] transition-colors">
              Inventory
            </Link>
          )}
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