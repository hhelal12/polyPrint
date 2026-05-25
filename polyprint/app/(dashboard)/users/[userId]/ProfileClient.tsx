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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-[#3CCFD0]/10 border-4 border-[#3CCFD0]/20 flex items-center justify-center text-[#0D284A] text-3xl font-bold mb-4">
            {(profile.full_name || "U").charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-[#0D284A] text-center">{profile.full_name || "Unknown"}</h2>
          <span className="mt-2 px-3 py-1 bg-[#0A4F8B]/5 text-[#0A4F8B] text-[10px] font-bold uppercase tracking-widest rounded-full">
            {profile.role}
          </span>

          <div className="w-full mt-8 space-y-3">
            <button onClick={() => setIsEditing(!isEditing)} className="w-full py-2 bg-[#3CCFD0] text-white rounded-xl font-bold text-sm hover:opacity-90">
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
            <button onClick={handleDelete} disabled={loading} className="w-full py-2 border border-red-200 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 disabled:opacity-50">
              {loading ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </div>

        {/* Account Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-bold text-[#0D284A] uppercase tracking-wider">Account Details</h3>
              {isEditing && (
                <button onClick={handleUpdate} disabled={loading} className="text-xs bg-[#0D284A] text-white px-6 py-2 rounded-xl font-bold">
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
              <EditableField label="Full Name" value={formData.full_name} isEditing={isEditing} onChange={(v) => setFormData({...formData, full_name: v})} />

              <div className="group">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System User ID</label>
                  <button onClick={handleCopyId} className="text-[9px] bg-slate-100 text-[#3CCFD0] px-2 py-0.5 rounded-md font-bold hover:bg-[#3CCFD0] hover:text-white transition-all uppercase tracking-tighter">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-[#0D284A] font-mono text-[11px] opacity-60 break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {profile.id}
                </p>
              </div>

              <div className="group">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Email Address</label>
                <p className="text-[#0D284A] font-medium opacity-60">{profile.email}</p>
              </div>

              {userRole === "student" && (
                <EditableField label="Polytechnic ID" value={formData.student_id || ""} isEditing={isEditing} onChange={(v) => setFormData({...formData, student_id: v})} />
              )}
              {userRole === "staff" && (
                <EditableField label="Manager ID" value={formData.manager_id || ""} isEditing={isEditing} onChange={(v) => setFormData({...formData, manager_id: v})} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popup Component Instance */}
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
    <div className="group">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 group-hover:text-[#3CCFD0] transition-colors">{label}</label>
      {isEditing ? (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0D284A] focus:ring-2 focus:ring-[#3CCFD0]/20 focus:outline-none" />
      ) : (
        <p className="text-[#0D284A] font-medium text-lg leading-none">{value || <span className="text-slate-300 italic font-normal">Not Set</span>}</p>
      )}
    </div>
  );
}