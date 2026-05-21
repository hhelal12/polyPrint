// lib/orders/pdfUtils.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { PDFDocument } from "pdf-lib"; // Make sure to run: npm i pdf-lib

export async function getPdfPageCountAction(storagePath: string): Promise<number> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    // 1. Download the file stream data directly from your bucket matrix
    const { data, error } = await supabase.storage
      .from("print-files")
      .download(storagePath);

    if (error) throw error;
    if (!data) throw new Error("File array buffer stream returned empty.");

    // 2. Transform blob matrix into an ArrayBuffer readable by the backend compiler
    const arrayBuffer = await data.arrayBuffer();

    // 3. Securely load document structural metadata maps
    const pdfDoc = await PDFDocument.load(arrayBuffer, { 
      ignoreEncryption: true // Prevents crashing on encrypted student files
    });

    // 4. Retrieve exact physical pages total array count
    const totalPagesCount = pdfDoc.getPageCount();

    return totalPagesCount || 1; // Fallback cleanly to 1 if layout is missing pages count properties

  } catch (err: any) {
    console.error("PDF engine parser broke down sequence execution:", err.message);
    return 1; // Safely return fallback so the frontend UI doesn't crash completely
  }
}