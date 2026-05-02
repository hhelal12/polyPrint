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

  useEffect(() => {
    const checkSession = async () => {
      // Small delay to allow Supabase to process the hash fragment
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

      // If we have a session OR a user, the link worked! 
      // We only show an error if BOTH are missing.
      if (!session && !user) {
        setError("Invalid or expired invite link.");
      }
      setLoading(false);
    };
    checkSession();
  }, [supabase]);

  // Validation Logic: 8-12 chars, Upper, Lower, Special
  const validatePassword = (pass: string) => {
    const minLength = 8;
    const maxLength = 12;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    if (pass.length < minLength || pass.length > maxLength) {
      return `Password must be between ${minLength} and ${maxLength} characters.`;
    }
    if (!hasUpperCase) return "Include at least one uppercase letter.";
    if (!hasLowerCase) return "Include at least one lowercase letter.";
    if (!hasSpecialChar) return "Include at least one special character.";
    
    return null;
  };

  const handleSetPassword = async () => {
    const errorMsg = validatePassword(password);
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }

    setValidationError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.updateUser({
      password: password
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  if (loading && !password) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-[#F4F7F9]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3CCFD0]"></div>
        <p className="mt-4 text-gray-500 font-medium">Verifying your secure link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9] p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-[#0D284A]">Welcome to CDOFS</h1>
        <p className="mb-8 text-gray-500 text-center text-sm">
          Set your account password to complete registration.
        </p>
        
        {/* Critical Error Display */}
        {error && (
          <div className="w-full p-4 mb-6 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
            <strong>Access Issue:</strong> {error}
            <p className="mt-2 text-xs opacity-70">Try requesting a new invite from the admin.</p>
          </div>
        )}
        
        {/* Password Validation Display */}
        {validationError && (
          <div className="w-full p-3 mb-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-700 text-xs text-center animate-in fade-in slide-in-from-top-1">
            ⚠️ {validationError}
          </div>
        )}

        <div className="flex flex-col gap-1 w-full">
          <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-wider">New Password</label>
          <input 
            type="password" 
            placeholder="••••••••"
            className={`w-full border p-3.5 rounded-xl mb-4 outline-none transition-all focus:ring-4 ${
              validationError ? 'border-red-200 focus:ring-red-50' : 'border-gray-100 focus:ring-[#3CCFD0]/10 focus:border-[#3CCFD0]'
            }`}
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
          className="w-full bg-[#0A4F8B] hover:bg-[#0D284A] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {loading ? "Finalizing Account..." : "Confirm & Continue"}
        </button>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-2 text-[9px] text-gray-400 uppercase tracking-tighter border-t border-gray-50 pt-6 w-full">
          <span className={password.length >= 8 && password.length <= 12 ? "text-green-500" : ""}>✓ 8-12 Characters</span>
          <span className={/[A-Z]/.test(password) ? "text-green-500" : ""}>✓ Uppercase (A-Z)</span>
          <span className={/[a-z]/.test(password) ? "text-green-500" : ""}>✓ Lowercase (a-z)</span>
          <span className={/[!@#$%^&*()]/.test(password) ? "text-green-500" : ""}>✓ Special Char</span>
        </div>
      </div>
    </div>
  );
}