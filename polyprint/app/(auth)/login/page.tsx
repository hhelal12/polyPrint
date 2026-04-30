"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const roles = [
        { id: "student", label: "Student", desc: "Order printing for courses", icon: "🎓" },
        { id: "staff", label: "Staff", desc: "Departmental print requests", icon: "👔" },
        { id: "manager", label: "Line Manager", desc: "Approve & track budgets", icon: "📋" },
        { id: "admin", label: "Admin", desc: "System & User management", icon: "⚙️" },
        { id: "external", label: "Guest", desc: "Non-Polytechnic users", icon: "🌐" },
    ];

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Standard Supabase Auth
        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        //  Gatekeeper Check Does the DB role match the selected role?
        const actualRole = data.user?.user_metadata?.role?.toLowerCase();
        const selectedRole = userRole?.toLowerCase();

        const roleMapping: Record<string, string> = {
            student: "student",
            staff: "staff",
            manager: "line_manager",
            admin: "admin",
            external: "guest"
        };

        if (actualRole !== roleMapping[selectedRole as string]) {
            // If they don't match, Kick them out!
            await supabase.auth.signOut();
            setError(`Access Denied: This account is not registered as a ${userRole}.`);
            setLoading(false);
            return;
        }

        // 4. Success!
        router.push("/dashboard");
        router.refresh();
    };
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-[#F4F7F9]">
            <div className="w-full max-w-2xl">

                {/* Header */}
                <div className="mb-10 text-center">
                    <Image src="/logo.svg" alt="Logo" width={200} height={200} className="mx-auto mb-4" priority />
                    <h1 className="text-3xl font-bold text-[#0D284A]">PolyPrint Portal</h1>
                    <p className="text-gray-500 mt-2">Sign in to manage your digital copy centre requests</p>
                </div>

                {/* STAGE 1: ROLE SELECTION */}
                {!userRole ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in zoom-in duration-300">
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => setUserRole(role.id)}
                                // Added border-gray-200 and bg-white/80 so buttons are visible immediately
                                className="group p-6 bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:border-[#3CCFD0] hover:shadow-xl transition-all text-left"
                            >
                                <span className="text-3xl mb-3 block">{role.icon}</span>
                                <h3 className="font-bold text-[#0D284A] group-hover:text-[#0A4F8B]">{role.label}</h3>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{role.desc}</p>
                            </button>
                        ))}
                    </div>
                ) : (
                    /* STAGE 2: LOGIN FORM */
                    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
                        <button
                            onClick={() => {
                                setUserRole(null);
                                setError(null);
                            }}
                            className="text-xs font-bold text-[#0A4F8B] mb-6 flex items-center hover:underline uppercase tracking-wider"
                        >
                            ← Switch Role
                        </button>

                        <h2 className="text-2xl font-bold text-[#0D284A] mb-1 capitalize">{userRole} Login</h2>
                        <p className="text-sm text-gray-500 mb-8">
                            {userRole === 'external' ? 'Access as a guest user' : 'Use your institutional account'}
                        </p>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* ERROR DISPLAY: This is the missing piece that shows the "invalid credentials" message */}
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm animate-in shake-in">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">Error:</span>
                                        <span>{error}</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#0D284A] uppercase ml-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="email@example.com"
                                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#3CCFD0] focus:ring-2 focus:ring-[#3CCFD0]/10 outline-none transition-all text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#0D284A] uppercase ml-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#3CCFD0] focus:ring-2 focus:ring-[#3CCFD0]/10 outline-none transition-all text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#0A4F8B] hover:bg-[#0D284A] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
                            >
                                {loading ? "Authenticating..." : "Sign In"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}