"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/auth/users";

export default function CreateUserPage() {
  const router = useRouter();

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Student");
  const [manager_id, setManagerId] = useState("");
  const [student_id, setStudentId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    const result = await createUser({
      full_name,
      email,
      role: role as "Admin" | "Staff" | "Student" | "line_manager" | "Guest",
      manager_id: manager_id || undefined,
      student_id: student_id || undefined,
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
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0D284A]">
          Create New User
        </h1>
        <p className="text-gray-500 mt-2">
          Invite a user and assign their system role.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6"
      >
        {/* Full Name */}
        <div className="space-y-2">
          <label className="font-semibold text-sm text-gray-600">
            Full Name
          </label>

          <input
            type="text"
            required
            value={full_name}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3CCFD0]"
            placeholder="John Smith"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="font-semibold text-sm text-gray-600">
            Email Address
          </label>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3CCFD0]"
            placeholder="john@email.com"
          />
        </div>

        {/* Role */}
        <div className="space-y-2">
          <label className="font-semibold text-sm text-gray-600">
            Role
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3CCFD0]"
          >
            <option value="Student">Student</option>
            <option value="Staff">Staff</option>
            <option value="line_manager">Line Manager</option>
            <option value="Admin">Admin</option>
            <option value="Guest">Guest</option>
          </select>
        </div>

        {/* Student ID */}
        {role === "Student" && (
          <div className="space-y-2">
            <label className="font-semibold text-sm text-gray-600">
              Student ID
            </label>

            <input
              type="text"
              value={student_id}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3CCFD0]"
              placeholder="ST12345"
            />
          </div>
        )}

        {/* Manager ID */}
        {role === "Staff" && (
          <div className="space-y-2">
            <label className="font-semibold text-sm text-gray-600">
              Manager ID
            </label>

            <input
              type="text"
              value={manager_id}
              onChange={(e) => setManagerId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3CCFD0]"
              placeholder="MGR1001"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3CCFD0] text-white py-4 rounded-xl font-bold hover:bg-[#0D284A] transition-all disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}