"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { submitOrderAction } from "@/lib/orders/order";
import { useRouter } from "next/navigation";

export default function NewOrderPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        service_type: "Printing",
        paper_size: "A4",
        color_mode: "Black & White",
        quantity: 1,
        special_instructions: ""
    });

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + " " + ["Bytes", "KB", "MB"][i];
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            if (!file) throw new Error("Please upload a PDF file");

            // 1. Upload file to bucket
            const fileName = `${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from("print-files")
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Submit order (Notice manager_id is NOT sent here)
            const result = await submitOrderAction({
                ...formData,
                file_url: fileName,
            });

            if (result.error) throw new Error(result.error);

            router.push("/dashboard");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-100 mt-10">
            <header className="mb-10 text-center">
                <h1 className="text-3xl font-bold text-slate-900">PolyPrint Request</h1>
                <p className="text-slate-500 mt-2">Submit your material for Copy Centre approval.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Service Type</label>
                        <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                            onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                        >
                            <option>Printing</option>
                            <option>Scanning</option>
                            <option>Binding</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Quantity</label>
                        <input
                            type="number"
                            min="1"
                            required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                            value={isNaN(formData.quantity) ? "" : formData.quantity}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setFormData({ ...formData, quantity: val });
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Paper Size</label>
                        <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                            onChange={(e) => setFormData({ ...formData, paper_size: e.target.value })}
                        >
                            <option>A4</option>
                            <option>A3</option>
                            <option>A2</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Color Mode</label>
                        <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                            onChange={(e) => setFormData({ ...formData, color_mode: e.target.value })}
                        >
                            <option>Black & White</option>
                            <option>Full Color</option>
                        </select>
                    </div>
                </div>

                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:bg-slate-50 transition-all group">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <span className="text-cyan-600 font-bold">PDF</span>
                        </div>
                        <p className="text-slate-600 font-medium">
                            {file ? <span className="text-slate-900">{file.name}</span> : "Upload Material PDF"}
                        </p>
                        {file && <p className="text-cyan-600 text-xs font-mono mt-1">{formatFileSize(file.size)}</p>}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 disabled:bg-slate-300 shadow-lg shadow-slate-900/10 transition-all"
                >
                    {loading ? "Processing..." : "Send to Line Manager"}
                </button>
            </form>
        </div>
    );
}