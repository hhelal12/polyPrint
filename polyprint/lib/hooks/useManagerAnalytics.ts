import { useEffect, useState, useRef } from "react";
import { getDetailedManagerAnalytics } from "@/lib/analysis/manger";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function useManagerAnalytics() {
  const [data, setData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDetailedManagerAnalytics().then(setData);
  }, []);

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { 
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("PolyPrint_Report.pdf");
    } catch (error) {
      console.error("Failed to generate report vector:", error);
    } finally {
      setDownloading(false);
    }
  };

  return {
    data,
    downloading,
    reportRef,
    downloadPDF,
  };
}