import Link from "next/link";
import { getAllUsers } from "@/lib/auth/users";

export default async function UsersPage() {
  const { data: users, error } = await getAllUsers();

  if (error) {
    return <div className="p-6 text-red-500 font-bold">Error: {error}</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with "Create" Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0D284A]">User Management</h1>
          <p className="text-gray-500">View and manage all registered accounts</p>
        </div>
        
        <Link 
          href="/users/create" 
          className="bg-[#3CCFD0] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0D284A] transition-all shadow-md active:scale-95"
        >
          + Create New User
        </Link>
      </div>

      <hr className="border-gray-100" />

      {/* User List */}
      <div className="grid gap-4">
        {users?.map((user) => (
          <Link 
            key={user.id}
            href={`/users/${user.id}`} 
            className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-[#3CCFD0] hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-4">
              {/* Avatar Circle */}
              <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-[#0D284A] font-bold border border-gray-100 group-hover:bg-[#3CCFD0]/10 transition-colors">
                {user.full_name?.charAt(0) || "U"}
              </div>
              
              <div>
                <h3 className="font-bold text-[#0D284A] group-hover:text-[#3CCFD0] transition-colors">
                  {user.full_name}
                </h3>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                {user.role}
              </span>
              <span className="text-gray-300 group-hover:text-[#3CCFD0] transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        ))}

        {users?.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}