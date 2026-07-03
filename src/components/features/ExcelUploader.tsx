"use client";

import * as React from "react"
import { Upload, Download } from "lucide-react"
import * as XLSX from "xlsx-js-style"
import { Button } from "@/components/ui/Button"

interface ExcelUploaderProps {
  onUpload: (data: any[]) => void;
  dataToDownload: any[];
  fileName?: string;
}

export function ExcelUploader({ onUpload }: { onUpload: (data: any[]) => void }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      onUpload(data);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
        <Upload className="w-4 h-4 mr-2" />
        Upload Excel
      </Button>
    </div>
  )
}

interface ExcelDownloaderProps {
  dataToDownload: any[];
  fileName?: string;
}

export function ExcelDownloader({ dataToDownload, fileName = "data_guide.xlsx" }: ExcelDownloaderProps) {
  const handleDownload = () => {
    const formattedData = dataToDownload.map(item => ({
      "Category": item.category || "",
      "Current Term": item.current_term || "",
      "Standard EN": item.standard_en || "",
      "Korean Meaning": item.korean_meaning || "",
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Category
      { wch: 25 }, // Current Term
      { wch: 50 }, // Standard EN
      { wch: 50 }, // Korean Meaning
    ];

    // Set row heights
    ws['!rows'] = [
      { hpt: 27 }, // Header row height
    ];

    // Apply styles to all cells
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:D1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = { c: C, r: R };
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        if (!ws[cellRef]) continue;

        const border = {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        };

        if (R === 0) {
          ws[cellRef].s = {
            font: { bold: true, color: { rgb: "000000" } },
            fill: { fgColor: { rgb: "DDEBF7" } }, // Light blue
            border,
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        } else {
          ws[cellRef].s = {
            font: { color: { rgb: "000000" } },
            border,
            alignment: { vertical: 'center' }
          };
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Button 
      className="bg-[#107c41] hover:bg-[#185c37] text-white border-none shadow-sm" 
      onClick={handleDownload}
    >
      <Download className="w-4 h-4 mr-2" />
      Download Excel
    </Button>
  )
}
