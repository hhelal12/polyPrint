"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUser, getAllUsers } from "@/lib/auth/users";
import BackButton from "@/components/ui/BackButton"; 

// FIX: Updated types to allow string | null, matching the Supabase schema matrix output
interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
}

export default function CreateUserPage() {
  const router = useRouter();

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Student");
  const [manager_id, setManagerId] = useState("");
  const [student_id, setStudentId] = useState("");

  // Storage for line managers dropdown population
  const [managersList, setManagersList] = useState<UserProfile[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch all users to filter and extract Line Managers safely on layout mount
  useEffect(() => {
    async function fetchManagersData() {
      setLoadingManagers(true);
      try {
        const { data, error } = await getAllUsers();
        if (!error && data) {
          // Filter to only capture users who hold the "line_manager" structural role
          const filteredManagers = data.filter(
            (u: any) => u.role === "line_manager"
          );
          setManagersList(filteredManagers);
        }
      } catch (err) {
        console.error("Failed loading platform managers matrix:", err);
      } finally {
        setLoadingManagers(false);
      }
    }
    fetchManagersData();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    const result = await createUser({
      full_name,
      email,
      role: role as "Admin" | "Staff" | "Student" | "line_manager" | "Guest",
      manager_id: role === "Staff" ? manager_id || undefined : undefined,
      student_id: role === "Student" ? student_id || undefined : undefined,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess("User created successfully. Invitation email sent.");

    setTimeout(() => {
      router.push("/users");
      router.refresh();
    }, 1200);
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 min-h-screen">
      {/* Navigation Button Block */}
      <div className="inline-block select-none">
        <BackButton href="/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header View Typography */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0D284A] tracking-tight">
          Create New User
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Invite a user and assign their system role.
        </p>
      </div>

      {/* Main Registration Form Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm space-y-5 sm:space-y-6"
      >
        {/* Full Name Input Field */}
        <div className="space-y-1.5">
          <label className="font-bold text-xs sm:text-sm text-gray-600 block pl-0.5">
            Full Name
          </label>
          <input
            type="text"
            required
            value={full_name}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[#3CCFD0]/40 focus:border-[#3CCFD0]/60 placeholder-gray-400 text-[#0D284A]"
            placeholder="John Smith"
          />
        </div>

        {/* Email Input Field */}
        <div className="space-y-1.5">
          <label className="font-bold text-xs sm:text-sm text-gray-600 block pl-0.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[#3CCFD0]/40 focus:border-[#3CCFD0]/60 placeholder-gray-400 text-[#0D284A]"
            placeholder="john@email.com"
          />
        </div>

        {/* Dynamic Role Selection Menu */}
        <div className="space-y-1.5">
          <label className="font-bold text-xs sm:text-sm text-gray-600 block pl-0.5">
            Role
          </label>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-[#3CCFD0]/40 focus:border-[#3CCFD0]/60 text-[#0D284A] font-medium appearance-none cursor-pointer"
            >
              <option value="Student">Student</option>
              <option value="Staff">Staff</option>
              <option value="line_manager">Line Manager</option>
              <option value="Admin">Admin</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* 1. Conditional Student ID Input Block — Numbers Only Enforced */}
        {role === "Student" && (
          <div className="space-y-1.5 animate-fadeIn">
            <label className="font-bold text-xs sm:text-sm text-gray-600 block pl-0.5">
              Student ID
            </label>
            <input
              type="text" 
              inputMode="numeric"
              pattern="[0-9]*"
              required
              value={student_id}
              onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ""))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[#3CCFD0]/40 focus:border-[#3CCFD0]/60 placeholder-gray-400 text-[#0D284A]"
              placeholder="e.g. 202400123"
            />
          </div>
        )}

        {/* 2. Conditional Line Manager Dropdown Block */}
        {role === "Staff" && (
          <div className="space-y-1.5 animate-fadeIn">
            <label className="font-bold text-xs sm:text-sm text-gray-600 block pl-0.5">
              Assign Line Manager
            </label>
            <div className="relative">
              <select
                required
                value={manager_id}
                onChange={(e) => setManagerId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-[#3CCFD0]/40 focus:border-[#3CCFD0]/60 text-[#0D284A] font-medium appearance-none cursor-pointer"
              >
                <option value="">
                  {loadingManagers ? "Loading Managers..." : "-- Select Line Manager --"}
                </option>
                {managersList.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {/* FIX: Handled potentially null names and emails using fallback short-circuits */}
                    {(manager.full_name || "Unnamed Manager")} ({(manager.email || "No Email available")})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Notification Feedback States */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium break-words">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium break-words">
            🎉 {success}
          </div>
        )}

        {/* Submit Execution Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3CCFD0] text-white py-3 sm:py-4 px-4 rounded-xl text-sm font-bold shadow-sm transition-all hover:bg-[#0D284A] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Creating User..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}