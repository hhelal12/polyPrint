"use client";

import { useAuditLogs } from "@/lib/hooks/useAuditLogs";

export default function AuditLogsPage() {
  const {
    groupedFiles,
    content,
    selectedFile,
    downloadUrl,
    isViewingLog,
    setIsViewingLog,
    handleFileClick,
  } = useAuditLogs();

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 bg-slate-50 min-h-screen">
      
      {/* Header Block */}
      <header className={`${isViewingLog ? "hidden lg:block" : "block"}`}>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0D284A] tracking-tight">
          System Audit Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Historical view of all system actions.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Sidebar Panel: Grouped Logs Selection Queue */}
        <div 
          className={`lg:col-span-3 space-y-6 lg:h-[75vh] lg:overflow-y-auto lg:pr-2 ${
            isViewingLog ? "hidden lg:block" : "block"
          }`}
        >
          {Object.keys(groupedFiles).length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border text-xs text-slate-400">
              No log traces identified.
            </div>
          ) : (
            Object.entries(groupedFiles).map(([group, groupFiles]) => (
              <div key={group} className="space-y-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  {group}
                </h3>
                <div className="space-y-1">
                  {groupFiles.map((file) => (
                    <button
                      key={file.name}
                      onClick={() => handleFileClick(file.name)}
                      className={`w-full p-3 rounded-xl text-xs sm:text-sm font-medium transition-all text-left truncate block border ${
                        selectedFile === file.name 
                          ? "bg-[#0D284A] border-[#0D284A] text-white shadow-sm" 
                          : "bg-white hover:bg-slate-100 text-slate-600 border-slate-100"
                      }`}
                    >
                      {file.name.replace(".log", "")}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Main Terminal View Frame */}
        <div 
          className={`lg:col-span-9 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm space-y-4 ${
            isViewingLog ? "block" : "hidden lg:block"
          }`}
        >
          {/* Terminal Context Action Bar */}
          <div className="flex flex-row justify-between items-center gap-3 border-b border-slate-50 pb-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* Back Button for mobile navigation screens */}
              <button
                onClick={() => setIsViewingLog(false)}
                className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0 text-sm font-bold transition-colors"
                aria-label="Back to file listing"
              >
                ← List
              </button>
              <h2 className="font-bold text-sm sm:text-base text-slate-800 truncate min-w-0">
                {selectedFile || "Select a log file"}
              </h2>
            </div>
            
            {selectedFile && (
              <a 
                href={downloadUrl} 
                download={selectedFile}
                className="px-3 py-2 sm:px-4 bg-emerald-600 text-white text-[11px] sm:text-xs font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm shrink-0 whitespace-nowrap"
              >
                Download Log
              </a>
            )}
          </div>
          
          {/* Monospaced Log Code Container */}
          <div className="relative">
            <pre className="bg-slate-900 text-cyan-300 p-4 sm:p-6 rounded-xl sm:rounded-2xl overflow-x-auto text-[11px] sm:text-xs h-[60vh] lg:h-[550px] font-mono border border-slate-800 shadow-inner whitespace-pre-wrap sm:whitespace-pre md:break-normal break-all">
              {content || "Select a log file from the menu grid options above to trace execution pipelines."}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}