"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, FileJson } from "lucide-react";
import {
  exportToPDF,
  exportToExcel,
  exportToJSON,
} from "@/lib/utils/export.utils";

interface ExportButtonsProps {
  data: any[];
  fileName?: string;
}

export function ExportButtons({
  data,
  fileName = "time-entries",
}: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "pdf" | "excel" | "json") => {
    setIsExporting(true);
    try {
      switch (format) {
        case "pdf":
          await exportToPDF(data, fileName);
          break;
        case "excel":
          await exportToExcel(data, fileName);
          break;
        case "json":
          exportToJSON(data, fileName);
          break;
      }
    } catch (error) {
      console.error(`Export to ${format} failed:`, error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="mr-2 h-4 w-4" />
          PDF Document
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel Spreadsheet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileJson className="mr-2 h-4 w-4" />
          JSON File
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
