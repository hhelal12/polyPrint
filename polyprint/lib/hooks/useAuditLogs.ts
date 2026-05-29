import { useState, useEffect } from "react";
import { listAuditFiles, getFileContent, getDownloadUrl } from "@/lib/audit/audit";

export interface StorageFile {
  name: string;
  created_at: string;
}

export function useAuditLogs() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [content, setContent] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [isViewingLog, setIsViewingLog] = useState<boolean>(false);

  useEffect(() => {
    listAuditFiles().then((data) => setFiles(data as StorageFile[]));
  }, []);

  const handleFileClick = async (name: string) => {
    setSelectedFile(name);
    setIsViewingLog(true); // Switches views on mobile layouts
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

  return {
    groupedFiles,
    content,
    selectedFile,
    downloadUrl,
    isViewingLog,
    setIsViewingLog,
    handleFileClick,
  };
}