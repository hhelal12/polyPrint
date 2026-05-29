import Link from "next/link";
import { getAllUsers } from "@/lib/auth/users";

export default async function UsersPage() {
  const { data: users, error } = await getAllUsers();

  if (error) {
    return <div className="p-4 sm:p-6 text-red-500 font-bold">Error: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-4 sm:border-none sm:pb-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0D284A] tracking-tight">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            View and manage all registered accounts
          </p>
        </div>
        
        <Link 
          href="/users/create" 
          className="bg-[#3CCFD0] text-white px-5 py-3 rounded-xl font-bold text-center text-sm hover:bg-[#0D284A] transition-all shadow-sm active:scale-95 sm:w-auto"
        >
          + Create New User
        </Link>
      </div>

      <hr className="hidden sm:block border-gray-100" />

      {/* User Directory List */}
      <div className="grid gap-3 sm:gap-4">
        {users?.map((user) => (
          <Link 
            key={user.id}
            href={`/users/${user.id}`} 
            className="flex items-center justify-between p-4 sm:p-5 bg-white border border-gray-100 rounded-2xl hover:border-[#3CCFD0] hover:shadow-sm transition-all group min-w-0 gap-4"
          >
            {/* Left Content Area */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {/* Avatar Circle */}
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-50 flex items-center justify-center text-[#0D284A] font-bold border border-gray-100 group-hover:bg-[#3CCFD0]/10 transition-colors shrink-0 select-none">
                {user.full_name?.charAt(0) || "U"}
              </div>
              
              {/* Text Meta Container */}
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <h3 className="font-bold text-sm sm:text-base text-[#0D284A] group-hover:text-[#3CCFD0] transition-colors truncate">
                    {user.full_name}
                  </h3>
                  {/* Role Badge - Appears inline on desktop, stacks natively under title on mobile */}
                  <span className="self-start sm:self-auto px-2 py-0.5 bg-gray-50 text-gray-500 text-[9px] font-black uppercase tracking-widest rounded-md border border-gray-100">
                    {user.role}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 truncate break-all">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Right Interactive Arrow Trigger Component */}
            <div className="shrink-0 pl-1">
              <span className="inline-block text-gray-300 text-sm sm:text-base group-hover:text-[#3CCFD0] transition-transform group-hover:translate-x-1 duration-150">
                →
              </span>
            </div>
          </Link>
        ))}

        {/* Empty State Layout */}
        {users?.length === 0 && (
          <div className="text-center py-16 sm:py-20 bg-gray-50 rounded-2xl sm:rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 px-4 text-sm">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}