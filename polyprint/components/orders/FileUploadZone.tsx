interface Props {
    uploadingFile: boolean;
    localFileObject: File | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    formatFileSize: (bytes: number) => string;
}

export default function FileUploadZone({
    uploadingFile,
    localFileObject,
    onFileChange,
    formatFileSize,
}: Props) {
    return (
        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 sm:p-8 text-center hover:bg-slate-50 transition-all group">
            <input
                type="file"
                accept=".pdf"
                disabled={uploadingFile}
                onChange={onFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        uploadingFile ? "bg-amber-50 animate-pulse" : "bg-cyan-50 group-hover:scale-110"
                    }`}
                >
                    <span className={`font-bold text-xs ${uploadingFile ? "text-amber-600" : "text-cyan-600"}`}>
                        {uploadingFile ? "⚙️" : "PDF"}
                    </span>
                </div>

                <p className="text-sm font-medium text-slate-600">
                    {uploadingFile ? (
                        <span className="text-amber-600 font-semibold animate-pulse">
                            Uploading & Analyzing...
                        </span>
                    ) : localFileObject ? (
                        <span className="text-slate-900 font-semibold break-all">
                            {localFileObject.name}
                        </span>
                    ) : (
                        <span>Tap to upload PDF</span>
                    )}
                </p>

                {localFileObject && !uploadingFile && (
                    <p className="text-cyan-600 text-xs font-mono">
                        {formatFileSize(localFileObject.size)}
                    </p>
                )}
                {!localFileObject && !uploadingFile && (
                    <p className="text-xs text-slate-400">PDF files only</p>
                )}
            </div>
        </div>
    );
}