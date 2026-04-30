"use client";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SessionGuard() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // 15 minutes = 900,000 ms
    const timeout = setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
      alert("Session expired for security. Please log in again.");
    }, 900000); 

    return () => clearTimeout(timeout);
  }, [router, supabase]);

  return null; // This component doesn't render anything
}