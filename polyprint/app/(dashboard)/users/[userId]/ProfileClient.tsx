"use client";

import { useState } from "react";
import { updateUser, deleteUser } from "@/lib/auth/users";
import { useRouter } from "next/navigation";
import Popup from "@/components/ui/Popup";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  student_id?: string | null;
  manager_id?: string | null;
  created_at: string;
}

interface ProfileClientProps {
  profile: Profile;
}

interface EditableFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
}

export default function ProfileClient({ profile }: ProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    manager_id: profile.manager_id || "",
    student_id: profile.student_id || "",
  });

  // Popup state configuration
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error" | "info";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "info",
  });

  const router = useRouter();
  const userRole = profile.role?.toLowerCase() || "";

  const handleCopyId = () => {
    navigator.clipboard.writeText(profile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdate = async () => {
    setLoading(true);
    const result = await updateUser(profile.id, formData);
    if (result.success) {
      setIsEditing(false);
      router.refresh();
      setPopup({ isOpen: true, title: "Success", message: "Profile updated successfully.", variant: "success" });
    } else {
      setPopup({ isOpen: true, title: "Update Failed", message: result.error || "An error occurred.", variant: "error" });
    }
    setLoading(false);
  };

  const handleDelete = () => {
    setPopup({
      isOpen: true,
      title: "Delete User",
      message: "Are you sure? This will permanently delete this user.",
      variant: "error",
      onConfirm: async () => {
        setLoading(true);
        const result = await deleteUser(profile.id);
        if (result.success) {
          router.push("/users");
        } else {
          setPopup({ isOpen: true, title: "Error", message: result.error || "Failed to delete user.", variant: "error" });
          setLoading(false);
        }
      }
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Profile Sidebar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-[#3CCFD0]/10 border-4 border-[#3CCFD0]/20 flex items-center justify-center text-[#0D284A] text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 shrink-0 select-none">
            {(profile.full_name || "U").charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0D284A] text-center px-2 break-words max-w-full">
            {profile.full_name || "Unknown"}
          </h2>
          <span className="mt-1.5 px-3 py-1 bg-[#0A4F8B]/5 text-[#0A4F8B] text-[10px] font-bold uppercase tracking-widest rounded-full">
            {profile.role}
          </span>

          <div className="w-full mt-6 sm:mt-8 flex flex-row md:flex-col gap-3">
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className="flex-1 md:w-full py-2.5 bg-[#3CCFD0] text-white rounded-xl font-bold text-xs sm:text-sm hover:opacity-90 active:scale-[0.99] transition-all"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
            <button 
              onClick={handleDelete} 
              disabled={loading} 
              className="flex-1 md:w-full py-2.5 border border-red-200 text-red-500 rounded-xl font-bold text-xs sm:text-sm hover:bg-red-50 disabled:opacity-50 active:scale-[0.99] transition-all"
            >
              {loading ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </div>

        {/* Account Details Block */}
        <div className="md:col-span-2 space-y-6 min-w-0">
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
            <div className="flex flex-row justify-between items-center mb-6 sm:mb-8 pb-3 border-b border-slate-50 md:border-none md:pb-0 gap-4">
              <h3 className="text-xs sm:text-sm font-bold text-[#0D284A] uppercase tracking-wider">
                Account Details
              </h3>
              {isEditing && (
                <button 
                  onClick={handleUpdate} 
                  disabled={loading} 
                  className="text-xs bg-[#0D284A] text-white px-4 sm:px-6 py-2 rounded-xl font-bold hover:opacity-95 active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 sm:gap-y-8 gap-x-6">
              <EditableField 
                label="Full Name" 
                value={formData.full_name} 
                isEditing={isEditing} 
                onChange={(v) => setFormData({...formData, full_name: v})} 
              />

              <div className="group min-w-0">
                <div className="flex justify-between items-center mb-1.5 gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                    System User ID
                  </label>
                  <button 
                    onClick={handleCopyId} 
                    className="text-[9px] bg-slate-100 text-[#3CCFD0] px-2 py-0.5 rounded-md font-bold hover:bg-[#3CCFD0] hover:text-white transition-all uppercase tracking-tighter shrink-0"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-[#0D284A] font-mono text-[11px] opacity-60 break-all bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed select-all">
                  {profile.id}
                </p>
              </div>

              <div className="group min-w-0">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  Email Address
                </label>
                <p className="text-[#0D284A] font-medium text-sm sm:text-base opacity-60 break-all">
                  {profile.email}
                </p>
              </div>

              {userRole === "student" && (
                <EditableField 
                  label="Polytechnic ID" 
                  value={formData.student_id || ""} 
                  isEditing={isEditing} 
                  onChange={(v) => setFormData({...formData, student_id: v})} 
                />
              )}
              {userRole === "staff" && (
                <EditableField 
                  label="Manager ID" 
                  value={formData.manager_id || ""} 
                  isEditing={isEditing} 
                  onChange={(v) => setFormData({...formData, manager_id: v})} 
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popup Notification UI Component */}
      <Popup
        isOpen={popup.isOpen}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        onClose={() => setPopup(p => ({ ...p, isOpen: false }))}
        onConfirm={popup.onConfirm}
      />
    </>
  );
}

function EditableField({ label, value, isEditing, onChange }: EditableFieldProps) {
  return (
    <div className="group min-w-0">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 group-hover:text-[#3CCFD0] transition-colors">
        {label}
      </label>
      {isEditing ? (
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0D284A] focus:ring-2 focus:ring-[#3CCFD0]/20 focus:border-[#3CCFD0]/40 focus:outline-none transition-all" 
        />
      ) : (
        <p className="text-[#0D284A] font-medium text-base sm:text-lg break-words leading-tight">
          {value || <span className="text-slate-300 italic font-normal text-sm">Not Set</span>}
        </p>
      )}
    </div>
  );
}