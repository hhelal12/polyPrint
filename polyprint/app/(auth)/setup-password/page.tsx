"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ConfirmPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  // ... (useEffect and validatePassword remain exactly the same)
  useEffect(() => {
    const handleInvite = async () => {
      const params = new URLSearchParams(window.location.search);
      const token_hash = params.get("token_hash");
      const type = params.get("type");

      if (!token_hash || type !== "invite") {
        setError("Invalid invite link.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: "invite",
      });

      if (error) setError(error.message);
      setLoading(false);
    };
    handleInvite();
  }, [supabase]);

  const validatePassword = (pass: string) => {
    if (pass.length < 8 || pass.length > 12) return "Must be 8-12 characters.";
    if (!/[A-Z]/.test(pass)) return "Include an uppercase letter.";
    if (!/[a-z]/.test(pass)) return "Include a lowercase letter.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Include a special character.";
    return null;
  };

  const handleSetPassword = async () => {
    const errorMsg = validatePassword(password);
    if (errorMsg) { setValidationError(errorMsg); return; }
    setValidationError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) { setError(authError.message); setLoading(false); }
    else { router.push("/dashboard"); router.refresh(); }
  };

  if (loading && !password) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen bg-[#F4F7F9]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3CCFD0]"></div>
        <p className="mt-4 text-gray-500 font-medium text-sm">Verifying link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9] p-4">
      {/* Reduced padding for mobile (p-6) vs desktop (p-10) */}
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center w-full max-w-md">
        <h1 className="text-xl md:text-2xl font-bold mb-2 text-[#0D284A]">Welcome to CDOFS</h1>
        <p className="mb-6 text-gray-500 text-center text-xs md:text-sm">
          Set your account password to complete registration.
        </p>
        
        {error && (
          <div className="w-full p-4 mb-6 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs text-center">
            <strong>Access Issue:</strong> {error}
          </div>
        )}
        
        {validationError && (
          <div className="w-full p-3 mb-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-700 text-xs text-center">
            ⚠️ {validationError}
          </div>
        )}

        <div className="flex flex-col gap-1 w-full">
          <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-wider">New Password</label>
          <input 
            type="password" 
            placeholder="••••••••"
            className="w-full border border-gray-100 p-3.5 rounded-xl mb-4 outline-none transition-all focus:ring-4 focus:ring-[#3CCFD0]/10 focus:border-[#3CCFD0] text-sm"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationError) setValidationError(null);
            }}
          />
        </div>
        
        <button 
          onClick={handleSetPassword}
          disabled={loading || !!error}
          className="w-full bg-[#0A4F8B] hover:bg-[#0D284A] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 text-sm"
        >
          {loading ? "Finalizing..." : "Confirm & Continue"}
        </button>

        {/* Responsive grid: 1 column on mobile, 2 columns on tablets+ */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[9px] text-gray-400 uppercase tracking-tighter border-t border-gray-50 pt-6 w-full">
          <span className={password.length >= 8 && password.length <= 12 ? "text-green-500" : ""}>✓ 8-12 Characters</span>
          <span className={/[A-Z]/.test(password) ? "text-green-500" : ""}>✓ Uppercase (A-Z)</span>
          <span className={/[a-z]/.test(password) ? "text-green-500" : ""}>✓ Lowercase (a-z)</span>
          <span className={/[!@#$%^&*()]/.test(password) ? "text-green-500" : ""}>✓ Special Char</span>
        </div>
      </div>
    </div>
  );
}