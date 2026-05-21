import { GetAllPlatformFeedback } from "@/lib/Feedback/manger";
import LineManagerFeedbackDashboard from "./LineManagerFeedbackDashboard";

export default async function Page() {
  console.log("🎬 Server rendering manager feedback page wrapper...");
  
  // Fetch payload directly from the database server action
  const response = await GetAllPlatformFeedback();

  // 1. Critical Failure Fallback
  if (!response) {
    return (
      <div className="p-10 text-center text-red-500 font-mono text-xs">
        ❌ Server returned an empty response. Check backend console logs.
      </div>
    );
  }

  // 2. RLS or Access Permission Error Fallback 
  if (response.error) {
    return (
      <div className="p-10 max-w-xl mx-auto bg-red-50 border border-red-200 rounded-2xl my-10">
        <h3 className="text-red-800 font-bold mb-2">Database Connection Failed</h3>
        <p className="text-red-600 text-xs font-mono">{response.error}</p>
        <p className="text-slate-500 text-[11px] mt-4 italic">
          Tip: Verify your RLS policy handles 'line_manager' role permissions and that your profile user metadata matches.
        </p>
      </div>
    );
  }

  // Safe data extraction array handover
  const feedbackData = response.data || [];

  return <LineManagerFeedbackDashboard initialFeedback={feedbackData} />;
}