import Link from 'next/link';
import Image from 'next/image';
import LogoutBut from './logoutBut';
import SessionGuard from '../../lib/auth/SessionGuard';
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import NotificationBell from './NotificationBell';
import NavbarToggle from './NavbarToggle'; 

export default async function Navbar() {
  const data = await getCurrentUser();
  if (!data) return null;

  const { fullName, role } = data;
  const userId = data.user.id;
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
      { label: "Feedback", href: "/feedback/staff" }
    ],
    manager: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Approvals", href: "/approvals" }
    ],
    line_manager: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Feedback", href: "/feedback/manger" },
      { label: "Analysis", href: "/analysis" },
    ],
    admin: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "User Management", href: "/users" },
      { label: "Audit Logs", href: "/audit-logs" }
    ],
    external: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "New Order", href: "/orders/new" },
      { label: "My Order", href: "/orders" }
    ]
  };

  const navLinks = ROLE_NAV_CONFIG[userRoleKey] || [];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <SessionGuard />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        
        {/* Left Section: Mobile Toggle + Logo */}
        <div className="flex items-center gap-1">
          <NavbarToggle links={navLinks} />
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={30} height={30} priority />
            <span className="hidden sm:block text-xl font-extrabold text-[#0D284A] tracking-tight">
              Poly<span className="text-[#3CCFD0]">Print</span>
            </span>
          </Link>
        </div>

        {/* Center Section: Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-[#3CCFD0] transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section: User Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <NotificationBell currentUserId={userId} />

          <div className="hidden sm:flex items-center gap-4">
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-[#0D284A] leading-none">{fullName}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#3CCFD0] mt-1">{role}</span>
            </div>
          </div>

          <div className="h-9 w-9 rounded-full bg-[#3CCFD0]/10 border-2 border-[#3CCFD0] flex items-center justify-center text-[#0D284A] font-bold text-xs shadow-inner shrink-0">
            {initials}
          </div>

          <div className="hidden sm:block h-6 w-px bg-gray-200" />
          <LogoutBut />
        </div>
      </div>
    </nav>
  );
}