"use client";

import { useState, useEffect } from "react";
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

    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes("type=invite") || hash.includes("access_token=")) {
            router.replace(`/setup-password${hash}`);
        }
    }, [router]);

    // REMOVED 'external' role
    const roles = [
        { id: "student", label: "Student", desc: "Order printing", icon: "🎓" },
        { id: "staff", label: "Staff", desc: "Dept requests", icon: "👔" },
        { id: "manager", label: "Manager", desc: "Track budgets", icon: "📋" },
        { id: "admin", label: "Admin", desc: "System mgmt", icon: "⚙️" },
    ];

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        const actualRole = data.user?.user_metadata?.role?.toLowerCase();
        const selectedRole = userRole?.toLowerCase();

        const roleMapping: Record<string, string> = {
            student: "student",
            staff: "staff",
            manager: "line_manager",
            admin: "admin",
        };

        if (actualRole !== roleMapping[selectedRole as string]) {
            await supabase.auth.signOut();
            setError(`Access Denied: Not registered as ${userRole}.`);
            setLoading(false);
            return;
        }

        router.push("/dashboard");
        router.refresh();
    };

    return (
        // Mobile-first flexbox container
        <div className="flex min-h-screen items-center justify-center p-4 bg-[#F4F7F9]">
            <div className="w-full max-w-lg"> {/* Reduced max-w for better mobile feel */}

                <div className="mb-8 text-center">
                    <Image src="/logo.svg" alt="Logo" width={120} height={120} className="mx-auto mb-4" priority />
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0D284A]">PolyPrint Portal</h1>
                </div>

                {!userRole ? (
                    // MOBILE RESPONSIVE GRID: 1 column on mobile, 2 on tablet+
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => setUserRole(role.id)}
                                className="group p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-[#3CCFD0] transition-all text-left active:scale-[0.98]"
                            >
                                <span className="text-2xl mb-2 block">{role.icon}</span>
                                <h3 className="font-bold text-[#0D284A]">{role.label}</h3>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100">
                        <button
                            onClick={() => { setUserRole(null); setError(null); }}
                            className="text-xs font-bold text-[#0A4F8B] mb-6 hover:underline"
                        >
                            ← Back to Roles
                        </button>

                        <h2 className="text-xl font-bold text-[#0D284A] mb-6 capitalize">{userRole} Login</h2>
                        
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}
                            
                            <input
                                type="email"
                                required
                                placeholder="Institutional Email"
                                className="w-full p-4 rounded-xl border border-gray-200 text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <input
                                type="password"
                                required
                                placeholder="Password"
                                className="w-full p-4 rounded-xl border border-gray-200 text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#0A4F8B] text-white font-bold py-4 rounded-xl transition-all"
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}