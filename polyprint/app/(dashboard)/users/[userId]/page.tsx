import { getUser } from "@/lib/auth/users";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserDetailsPage({ params }: PageProps) {
  const { userId } = await params;
  const { data: profile, error } = await getUser(userId);

  // If user is not found or an error occurs, redirect to 404
  if (error || !profile) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto min-h-screen bg-[#FAFBFC]">
      {/* Header & Navigation Wrapper */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-10 gap-4 border-b border-slate-100 pb-4 md:pb-0 md:border-none">
        <div className="min-w-0">
          {/* Breadcrumbs - Wrap and truncate nicely if names get too long */}
          <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] font-bold uppercase tracking-widest text-[#3CCFD0] mb-1.5 sm:mb-2">
            <Link href="/users" className="hover:underline shrink-0">
              User Directory
            </Link>
            <span className="text-slate-300 select-none">/</span>
            <span className="text-slate-400 truncate">
              {profile.full_name || "Profile Details"}
            </span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0D284A] tracking-tight">
            Manage User
          </h1>
        </div>

        {/* Back Navigation Button - Automatically scales full width on mobile devices */}
        <Link
          href="/users"
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
        >
          <svg 
            width="14" 
            height="14" 
            className="sm:w-4 sm:h-4 shrink-0" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Directory
        </Link>
      </div>

      {/* Client Side Logic Component */}
      <div className="w-full min-w-0 overflow-hidden">
        <ProfileClient profile={profile} />
      </div>
    </div>
  );
}