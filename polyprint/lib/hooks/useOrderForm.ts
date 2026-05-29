import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { submitOrderAction } from "@/lib/orders/order";
import { NAME_WORD_LIMIT, DESC_WORD_LIMIT } from "@/constants/orderLimits";
import { getPdfPageCountAction } from "@/lib/orders/pdfUtils";
import { useRouter } from "next/navigation";

export function countWords(text: string) {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function useOrderForm() {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [localFileObject, setLocalFileObject] = useState<File | null>(null);

    const [popup, setPopup] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: "success" | "error" | "info";
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
        special_instructions: "",
    });

    // ── Word counts ──
    const nameWordCount = countWords(formData.order_name);
    const descWordCount = countWords(formData.description);
    const nameWordsLeft = NAME_WORD_LIMIT - nameWordCount;
    const descWordsLeft = DESC_WORD_LIMIT - descWordCount;

    // ── Field change handlers (blocks typing past limit) ──
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (countWords(val) <= NAME_WORD_LIMIT) {
            setFormData((prev) => ({ ...prev, order_name: val }));
        }
    };

    const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        if (countWords(val) <= DESC_WORD_LIMIT) {
            setFormData((prev) => ({ ...prev, description: val }));
        }
    };

    // ── Pricing ──
    const isColorMode = formData.color_mode === "color";
    let ratePerSheet = 0.025;
    if (formData.paper_size === "A3") {
        ratePerSheet = isColorMode ? 0.1 : 0.05;
    } else if (formData.paper_size === "A2") {
        ratePerSheet = isColorMode ? 0.15 : 0.075;
    } else {
        ratePerSheet = isColorMode ? 0.05 : 0.025;
    }

    const sheetsPerCopy =
        formData.print_sides === "Double-sided"
            ? Math.ceil(formData.detected_pages / 2)
            : formData.detected_pages;

    const dynamicTotalCost = sheetsPerCopy * formData.quantity * ratePerSheet;

    // ── File upload ──
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + " " + ["Bytes", "KB", "MB"][i];
    };

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
            setFormData((prev) => ({ ...prev, detected_pages: actualPages }));
        } catch (err: any) {
            setPopup({ isOpen: true, title: "Upload Failed", message: err.message, variant: "error" });
        } finally {
            setUploadingFile(false);
        }
    }

    // ── Submit — with word-count gate ──
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Guard: order name empty
        if (!formData.order_name.trim()) {
            setPopup({ isOpen: true, title: "Validation Error", message: "Order name cannot be empty.", variant: "error" });
            return;
        }

        // Guard: order name over limit
        if (countWords(formData.order_name) > NAME_WORD_LIMIT) {
            setPopup({
                isOpen: true,
                title: "Validation Error",
                message: `Order name must be ${NAME_WORD_LIMIT} words or fewer. Currently: ${countWords(formData.order_name)} words.`,
                variant: "error",
            });
            return;
        }

        // Guard: description over limit
        if (countWords(formData.description) > DESC_WORD_LIMIT) {
            setPopup({
                isOpen: true,
                title: "Validation Error",
                message: `Description must be ${DESC_WORD_LIMIT} words or fewer. Currently: ${countWords(formData.description)} words.`,
                variant: "error",
            });
            return;
        }

        // Guard: file not yet uploaded
        if (!uploadedFileName) {
            setPopup({
                isOpen: true,
                title: "Notice",
                message: "Please wait for your file to finish analyzing.",
                variant: "info",
            });
            return;
        }

        setLoading(true);

        try {
            const result = await submitOrderAction({
                ...formData,
                file_url: uploadedFileName,
                estimated_pages: formData.detected_pages,
            });

            if (result?.error) throw new Error(result.error);
            router.push("/dashboard");
        } catch (err: any) {
            setPopup({ isOpen: true, title: "Submission Error", message: err.message, variant: "error" });
        } finally {
            setLoading(false);
        }
    }

    const closePopup = () => setPopup((p) => ({ ...p, isOpen: false }));

    // Whether limits are exceeded (used to disable submit button)
    const isOverLimit = nameWordCount > NAME_WORD_LIMIT || descWordCount > DESC_WORD_LIMIT;

    return {
        formData,
        setFormData,
        loading,
        uploadingFile,
        uploadedFileName,
        localFileObject,
        popup,
        closePopup,
        nameWordCount,
        descWordCount,
        nameWordsLeft,
        descWordsLeft,
        handleNameChange,
        handleDescChange,
        handleFileChange,
        handleSubmit,
        dynamicTotalCost,
        formatFileSize,
        isOverLimit,
    };
}