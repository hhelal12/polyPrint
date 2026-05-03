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
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-[#FAFBFC]">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#3CCFD0] mb-2">
            <Link href="/users" className="hover:underline">User Directory</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">Profile Details</span>
          </nav>
          <h1 className="text-3xl font-black text-[#0D284A]">Manage User</h1>
        </div>
        <Link
          href="/users"
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Directory
        </Link>
      </div>

      {/* Render the Client Side Logic */}
      <ProfileClient profile={profile} />
    </div>
  );
}