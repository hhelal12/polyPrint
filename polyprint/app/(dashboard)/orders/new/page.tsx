"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { submitOrderAction } from "@/lib/orders/order";
import { getPdfPageCountAction } from "@/lib/orders/pdfUtils";
import { useRouter } from "next/navigation";
import Popup from "@/components/ui/Popup";
import BackButton from "@/components/ui/BackButton";

export default function NewOrderPage() {
    const router = useRouter();
    const supabase = createClient();
    
    const [loading, setLoading] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [localFileObject, setLocalFileObject] = useState<File | null>(null);

    // Popup State Management
    const [popup, setPopup] = useState<{
        isOpen: boolean; title: string; message: string; variant: "success" | "error" | "info";
    }>({ isOpen: false, title: "", message: "", variant: "info" });

    const [formData, setFormData] = useState({
        order_name: "",
        description: "",
        service_type: "Printing",
        paper_size: "A4",
        color_mode: "black_and_white",
        print_sides: "One-sided",
        quantity: 1,
        detected_pages: 0,
        special_instructions: ""
    });

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + " " + ["Bytes", "KB", "MB"][i];
    };

    let ratePerSheet = 0.025;
    const isColorMode = formData.color_mode === "color";

    if (formData.paper_size === "A3") {
        ratePerSheet = isColorMode ? 0.100 : 0.050;
    } else if (formData.paper_size === "A2") {
        ratePerSheet = isColorMode ? 0.150 : 0.075;
    } else {
        ratePerSheet = isColorMode ? 0.050 : 0.025;
    }

    const sheetsPerCopy = formData.print_sides === "Double-sided"
        ? Math.ceil(formData.detected_pages / 2)
        : formData.detected_pages;

    const dynamicTotalCost = sheetsPerCopy * formData.quantity * ratePerSheet;

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setLocalFileObject(selectedFile);
        setUploadingFile(true);

        try {
            const generatedPathName = `${Date.now()}_${selectedFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from("print-files")
                .upload(generatedPathName, selectedFile);

            if (uploadError) throw uploadError;
            setUploadedFileName(generatedPathName);

            const actualPages = await getPdfPageCountAction(generatedPathName);
            setFormData(prev => ({ ...prev, detected_pages: actualPages }));
        } catch (err: any) {
            setPopup({ isOpen: true, title: "Upload Failed", message: err.message, variant: "error" });
        } finally {
            setUploadingFile(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!uploadedFileName) {
            setPopup({ isOpen: true, title: "Notice", message: "Please wait for your file to finish analyzing.", variant: "info" });
            return;
        }
        setLoading(true);

        try {
            const result = await submitOrderAction({
                ...formData,
                file_url: uploadedFileName,
                estimated_pages: formData.detected_pages
            });

            if (result?.error) throw new Error(result.error);
            router.push("/dashboard");
        } catch (err: any) {
            setPopup({ isOpen: true, title: "Submission Error", message: err.message, variant: "error" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-100 mt-10">

            <div className="mb-6">
                <BackButton href="/dashboard" label="Back to Dashboard" />
            </div>
            
            <header className="mb-10 text-center">
                <h1 className="text-3xl font-bold text-slate-900">PolyPrint Request</h1>
                <p className="text-slate-500 mt-2">Submit your material for Copy Centre approval.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Fields Section */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Order Name / Title</label>
                        <input type="text" required placeholder="e.g., IT7099 Weekly Report" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-800 transition-all" value={formData.order_name} onChange={(e) => setFormData({ ...formData, order_name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                        <textarea placeholder="Briefly describe what this print is for..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none h-24 text-slate-800 transition-all" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                </div>

                <hr className="border-slate-100" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Service Type</label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-800" value={formData.service_type} onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}>
                            <option value="Printing">Printing</option>
                            <option value="Scanning">Scanning</option>
                            <option value="Binding">Printing posters</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Quantity (Copies)</label>
                        <input type="number" min="1" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-800" value={isNaN(formData.quantity) ? "" : formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Paper Size</label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-800" value={formData.paper_size} onChange={(e) => setFormData({ ...formData, paper_size: e.target.value })}>
                            <option value="A4">A4</option>
                            <option value="A3">A3</option>
                            <option value="A2">A2</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Color Mode</label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-800" value={formData.color_mode} onChange={(e) => setFormData({ ...formData, color_mode: e.target.value })}>
                            <option value="black_and_white">Black & White</option>
                            <option value="color">Full Color</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Sides</label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-800" value={formData.print_sides} onChange={(e) => setFormData({ ...formData, print_sides: e.target.value })}>
                            <option value="One-sided">One-sided</option>
                            <option value="Double-sided">Double-sided</option>
                        </select>
                    </div>
                </div>

                {/* File Upload Section */}
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-all group">
                    <input type="file" accept=".pdf" disabled={uploadingFile} onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all ${uploadingFile ? "bg-amber-50 animate-pulse animate-spin" : "bg-cyan-50 group-hover:scale-110"}`}>
                            <span className={`font-bold text-xs ${uploadingFile ? "text-amber-600" : "text-cyan-600"}`}>{uploadingFile ? "⚙️" : "PDF"}</span>
                        </div>
                        <p className="text-slate-600 text-sm font-medium">
                            {uploadingFile ? <span className="text-amber-600 font-semibold animate-pulse">Uploading...</span> : localFileObject ? <span className="text-slate-900 font-semibold">{localFileObject.name}</span> : "Upload Material PDF"}
                        </p>
                        {localFileObject && !uploadingFile && <p className="text-cyan-600 text-xs font-mono mt-1">{formatFileSize(localFileObject.size)}</p>}
                    </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-slate-900 border border-slate-950 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-center justify-between text-white shadow-xl">
                    <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verified Document Profile</span>
                        <div className="text-sm text-slate-200 font-medium">
                            {formData.detected_pages > 0 ? (
                                <div>📄 Total Document Pages: <strong className="text-cyan-400 font-mono text-base">{formData.detected_pages}</strong></div>
                            ) : uploadingFile ? <span className="text-amber-400 italic">Analyzing...</span> : <span className="text-slate-400">No document parsed.</span>}
                        </div>
                    </div>
                    <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Calculated Final Cost</span>
                        <span className="text-2xl font-black text-cyan-400 font-mono tracking-tight">BHD {dynamicTotalCost.toFixed(3)}</span>
                    </div>
                </div>

                <button type="submit" disabled={loading || uploadingFile || !uploadedFileName} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 disabled:bg-slate-300 transition-all">
                    {loading ? "Registering Request..." : "Send for Approval"}
                </button>
            </form>

            <Popup 
                isOpen={popup.isOpen}
                title={popup.title}
                message={popup.message}
                variant={popup.variant}
                onClose={() => setPopup(p => ({ ...p, isOpen: false }))}
            />
        </div>
    );
}