"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Popup from "@/components/ui/Popup"; // 1. Import Popup

export default function SessionGuard() {
  const supabase = createClient();
  const router = useRouter();
  
  //Add state for the Popup
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // 15 minutes = 900,000 ms
    const timeout = setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
      setShowPopup(true);
    }, 900000); 

    return () => clearTimeout(timeout);
  }, [router, supabase]);

  return (
    <Popup 
      isOpen={showPopup}
      title="Session Expired"
      message="Your session has expired for security reasons. Please log in again."
      variant="info"
      onClose={() => setShowPopup(false)}
    />
  );
}