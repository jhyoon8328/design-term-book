"use client";

import * as React from "react"
import { Upload, Download } from "lucide-react"
import * as XLSX from "xlsx-js-style"
import ExcelJS from "exceljs"
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
      className="bg-[#107c41] hover:bg-[#185c37] text-white border-none shadow-sm flex items-center whitespace-nowrap" 
      onClick={handleDownload}
    >
      <Download className="w-4 h-4 mr-2" />
      Download Excel
    </Button>
  )
}

export function AdminExcelDownloader({ dataToDownload, fileName = "fashion_term_data.xlsx" }: ExcelDownloaderProps) {
  const handleDownload = async () => {
    try {
      // 브라우저 캐시를 무시하고 항상 최신 파일을 가져오도록 타임스탬프 추가
      const response = await fetch('/template.xlsx?t=' + new Date().getTime());
      const arrayBuffer = await response.arrayBuffer();

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const worksheet = workbook.worksheets[0];

      dataToDownload.forEach((item, index) => {
        const rowIndex = index + 2;
        const row = worksheet.getRow(rowIndex);

        row.getCell(1).value = item.category || "";
        row.getCell(2).value = item.current_term || "";
        row.getCell(3).value = item.current_variants || "";
        row.getCell(4).value = item.standard_en || "";
        row.getCell(5).value = item.standard_en_short || "";
        row.getCell(6).value = item.korean_meaning || "";
        row.getCell(7).value = item.notes || "";
        row.getCell(8).value = item.card_row ? Number(item.card_row) : "";
        row.getCell(9).value = item.search_terms || "";
        row.getCell(10).value = item.use_in ? "Y" : "N";
        row.getCell(11).value = item.use_out ? "Y" : "N";
        row.getCell(12).value = item.FashionFiles && item.FashionFiles.length > 0 ? "Y" : "";

        // 행이 템플릿의 서식을 넘어갈 경우 첫 번째 데이터 행(2행)의 서식을 복사
        if (rowIndex > 2) {
          const templateRow = worksheet.getRow(2);
          for (let col = 1; col <= 12; col++) {
            row.getCell(col).style = templateRow.getCell(col).style;
          }
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading admin excel:", error);
      alert("Failed to download Excel file.");
    }
  };

  return (
    <Button 
      className="bg-[#107c41] hover:bg-[#185c37] text-white border-none shadow-sm flex items-center whitespace-nowrap" 
      onClick={handleDownload}
    >
      <Download className="w-4 h-4 mr-2" />
      Excel Down
    </Button>
  )
}
