// src/lib/utils/export.utils.ts
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { formatDuration } from "./time.utils";

// Extend jsPDF with autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export async function exportToPDF(data: any[], fileName: string) {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text("Time Entries Report", 14, 22);

  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 30);

  // Prepare table data
  const tableData = data.map((entry) => [
    format(new Date(entry.date), "PP"),
    entry.project?.name || "-",
    entry.description || "-",
    entry.workspace,
    entry.endTime
      ? formatDuration(
          new Date(entry.endTime).getTime() -
            new Date(entry.startTime).getTime(),
        )
      : "In progress",
  ]);

  // Add table
  doc.autoTable({
    startY: 35,
    head: [["Date", "Project", "Description", "Workspace", "Duration"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Save PDF
  doc.save(`${fileName}.pdf`);
}

export async function exportToExcel(data: any[], fileName: string) {
  // Transform data for Excel
  const excelData = data.map((entry) => ({
    Date: format(new Date(entry.date), "PP"),
    Project: entry.project?.name || "-",
    Description: entry.description || "-",
    Workspace: entry.workspace,
    "Start Time": format(new Date(entry.startTime), "HH:mm"),
    "End Time": entry.endTime ? format(new Date(entry.endTime), "HH:mm") : "-",
    Duration: entry.endTime
      ? formatDuration(
          new Date(entry.endTime).getTime() -
            new Date(entry.startTime).getTime(),
        )
      : "In progress",
    "Has Adjustments": entry.adjustments?.length > 0 ? "Yes" : "No",
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Auto-size columns
  const colWidths = [];
  for (let i = 0; i < Object.keys(excelData[0] || {}).length; i++) {
    colWidths.push({ wch: 15 });
  }
  ws["!cols"] = colWidths;

  // Add to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Time Entries");

  // Save file
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function exportToJSON(data: any[], fileName: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCSV(data: any[], fileName: string) {
  const headers = [
    "Date",
    "Project",
    "Description",
    "Workspace",
    "Start Time",
    "End Time",
    "Duration",
  ];

  const csvData = data.map((entry) => [
    format(new Date(entry.date), "yyyy-MM-dd"),
    entry.project?.name || "",
    entry.description || "",
    entry.workspace,
    format(new Date(entry.startTime), "HH:mm"),
    entry.endTime ? format(new Date(entry.endTime), "HH:mm") : "",
    entry.endTime
      ? formatDuration(
          new Date(entry.endTime).getTime() -
            new Date(entry.startTime).getTime(),
        )
      : "",
  ]);

  const csvContent = [
    headers.join(","),
    ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function prepareReportData(
  entries: any[],
  options?: {
    groupBy?: "day" | "project" | "workspace";
    includeSummary?: boolean;
  },
) {
  if (!options) return entries;

  const { groupBy, includeSummary } = options;
  let data = entries;

  if (groupBy === "day") {
    const grouped = entries.reduce((acc: any, entry) => {
      const date = format(new Date(entry.date), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = {
          date,
          entries: [],
          totalDuration: 0,
        };
      }
      acc[date].entries.push(entry);
      if (entry.endTime) {
        acc[date].totalDuration +=
          new Date(entry.endTime).getTime() -
          new Date(entry.startTime).getTime();
      }
      return acc;
    }, {});
    data = Object.values(grouped);
  }

  if (includeSummary) {
    const totalDuration = entries.reduce((sum, entry) => {
      if (entry.endTime) {
        return (
          sum +
          (new Date(entry.endTime).getTime() -
            new Date(entry.startTime).getTime())
        );
      }
      return sum;
    }, 0);

    return {
      data,
      summary: {
        totalEntries: entries.length,
        totalDuration,
        completedEntries: entries.filter((e) => e.endTime).length,
        activeEntries: entries.filter((e) => !e.endTime).length,
      },
    };
  }

  return data;
}
