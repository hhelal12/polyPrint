"use client";
import { useState, useEffect } from "react";
import { listAuditFiles, getFileContent, getDownloadUrl } from "@/lib/audit/audit";

interface StorageFile {
  name: string;
  created_at: string;
}

export default function AuditLogsPage() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [content, setContent] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");

  useEffect(() => {
    listAuditFiles().then((data) => setFiles(data as StorageFile[]));
  }, []);

  const handleFileClick = async (name: string) => {
    setSelectedFile(name);
    const [text, url] = await Promise.all([
      getFileContent(name),
      getDownloadUrl(name)
    ]);
    setContent(text);
    setDownloadUrl(url);
  };

  // Group files by Month/Year for clean organization
  const groupedFiles: Record<string, StorageFile[]> = files.reduce((acc, file) => {
    const date = new Date(file.created_at).toLocaleDateString(undefined, { 
      month: 'long', 
      year: 'numeric' 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(file);
    return acc;
  }, {} as Record<string, StorageFile[]>);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <header>
        <h1 className="text-3xl font-black text-[#0D284A]">System Audit Logs</h1>
        <p className="text-slate-500">Historical view of all system actions.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Grouped Logs */}
        <div className="lg:col-span-3 space-y-6 h-[70vh] overflow-y-auto pr-2">
          {Object.entries(groupedFiles).map(([group, groupFiles]) => (
            <div key={group}>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{group}</h3>
              <div className="space-y-1">
                {groupFiles.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => handleFileClick(file.name)}
                    className={`w-full p-3 rounded-xl text-sm font-medium transition-all text-left ${
                      selectedFile === file.name 
                        ? "bg-[#0D284A] text-white shadow-md" 
                        : "bg-white hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    {file.name.replace(".log", "")}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Main: Preview Area */}
        <div className="lg:col-span-9 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-800">{selectedFile || "Select a log file"}</h2>
            {selectedFile && (
              <a 
                href={downloadUrl} 
                download={selectedFile}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition"
              >
                Download File
              </a>
            )}
          </div>
          
          <pre className="bg-slate-900 text-cyan-300 p-6 rounded-2xl overflow-x-auto text-xs h-[500px] font-mono border border-slate-800">
            {content || "Select a log file from the left to view contents."}
          </pre>
        </div>
      </div>
    </div>
  );
}