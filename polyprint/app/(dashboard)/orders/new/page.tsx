"use client";

import Popup from "@/components/ui/Popup";
import BackButton from "@/components/ui/BackButton";
import OrderBasicFields from "@/components/orders/OrderBasicFields";
import OrderPrintOptions from "@/components/orders/OrderPrintOptions";
import FileUploadZone from "@/components/orders/FileUploadZone";
import PricingSummary from "@/components/orders/PricingSummary";
import { useOrderForm } from "@/lib/hooks/useOrderForm";

const FIELD_CLASS =
    "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-800 text-sm transition-all";

export default function NewOrderPage() {
    const {
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
    } = useOrderForm();

    const isSubmitDisabled = loading || uploadingFile || !uploadedFileName || isOverLimit;

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:py-10">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-8">

                <div className="mb-5">
                    <BackButton href="/dashboard" label="Back to Dashboard" />
                </div>

                <header className="mb-8 text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">PolyPrint Request</h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        Submit your material for Copy Centre approval.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <OrderBasicFields
                        orderName={formData.order_name}
                        description={formData.description}
                        nameWordCount={nameWordCount}
                        descWordCount={descWordCount}
                        nameWordsLeft={nameWordsLeft}
                        descWordsLeft={descWordsLeft}
                        onNameChange={handleNameChange}
                        onDescChange={handleDescChange}
                        fieldClass={FIELD_CLASS}
                    />

                    <hr className="border-slate-100" />

                    <OrderPrintOptions
                        formData={{
                            service_type: formData.service_type,
                            quantity: formData.quantity,
                            paper_size: formData.paper_size,
                            color_mode: formData.color_mode,
                            print_sides: formData.print_sides,
                        }}
                        onChange={(updated) => setFormData((prev) => ({ ...prev, ...updated }))}
                        fieldClass={FIELD_CLASS}
                    />

                    <FileUploadZone
                        uploadingFile={uploadingFile}
                        localFileObject={localFileObject}
                        onFileChange={handleFileChange}
                        formatFileSize={formatFileSize}
                    />

                    <PricingSummary
                        detectedPages={formData.detected_pages}
                        uploadingFile={uploadingFile}
                        dynamicTotalCost={dynamicTotalCost}
                    />

                    {/* Over-limit warning above button */}
                    {isOverLimit && (
                        <p className="text-xs text-red-500 text-center font-medium">
                            Please fix the word limit errors above before submitting.
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-base sm:text-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? "Registering Request..." : "Send for Approval"}
                    </button>

                </form>
            </div>

            <Popup
                isOpen={popup.isOpen}
                title={popup.title}
                message={popup.message}
                variant={popup.variant}
                onClose={closePopup}
            />
        </div>
    );
}