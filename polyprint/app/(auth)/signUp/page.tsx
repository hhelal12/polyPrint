"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignupPage() {
    const supabase = createClient();
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setError(null);
        setSuccess(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: "external",
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setSuccess("Account created successfully. Please check your email to verify your account.");
        setLoading(false);

        setTimeout(() => {
            router.push("/login");
        }, 2500);
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-[#F4F7F9]">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="mb-10 text-center">
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        width={180}
                        height={180}
                        className="mx-auto mb-4"
                        priority
                    />

                    <h1 className="text-3xl font-bold text-[#0D284A]">
                        Guest Registration
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Create an external user account for PolyPrint Portal
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">

                    <h2 className="text-2xl font-bold text-[#0D284A] mb-1">
                        Sign Up
                    </h2>

                    <p className="text-sm text-gray-500 mb-8">
                        Guest access only
                    </p>

                    <form onSubmit={handleSignup} className="space-y-4">

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                                <span className="font-bold">Error:</span> {error}
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm">
                                <span className="font-bold">Success:</span> {success}
                            </div>
                        )}

                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#0D284A] uppercase ml-1">
                                Full Name
                            </label>

                            <input
                                type="text"
                                required
                                placeholder="John Doe"
                                className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#3CCFD0] focus:ring-2 focus:ring-[#3CCFD0]/10 outline-none transition-all text-sm"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#0D284A] uppercase ml-1">
                                Email
                            </label>

                            <input
                                type="email"
                                required
                                placeholder="email@example.com"
                                className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#3CCFD0] focus:ring-2 focus:ring-[#3CCFD0]/10 outline-none transition-all text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#0D284A] uppercase ml-1">
                                Password
                            </label>

                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#3CCFD0] focus:ring-2 focus:ring-[#3CCFD0]/10 outline-none transition-all text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#0D284A] uppercase ml-1">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#3CCFD0] focus:ring-2 focus:ring-[#3CCFD0]/10 outline-none transition-all text-sm"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0A4F8B] hover:bg-[#0D284A] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                        {/* Login Link */}
                        <p className="text-center text-sm text-gray-500 pt-2">
                            Already have an account?{" "}
                            <span
                                onClick={() => router.push("/login")}
                                className="text-[#0A4F8B] font-semibold cursor-pointer hover:underline"
                            >
                                Sign In
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}