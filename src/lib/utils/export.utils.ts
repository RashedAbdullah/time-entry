import { saveAs } from "file-saver";

export async function exportToPDF(data: any[], fileName: string) {
  try {
    // Build query params
    const params = new URLSearchParams();
    if (data.length > 0) {
      // You might want to pass date range instead of full data
      params.append("startDate", data[0]?.date || "");
      params.append("endDate", data[data.length - 1]?.date || "");
    }

    const response = await fetch(
      `/api/reports/export/pdf?${params.toString()}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PDF Export Backend Error:", response.status, response.statusText, errorText);
      throw new Error(`Failed to export PDF: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const blob = await response.blob();
    saveAs(blob, `${fileName}.pdf`);
  } catch (error) {
    console.error("PDF export failed:", error);
    throw error;
  }
}

export async function exportToExcel(data: any[], fileName: string) {
  try {
    const params = new URLSearchParams();
    if (data.length > 0) {
      params.append("startDate", data[0]?.date || "");
      params.append("endDate", data[data.length - 1]?.date || "");
    }

    const response = await fetch(
      `/api/reports/export/excel?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error("Failed to export Excel");
    }

    const blob = await response.blob();
    saveAs(blob, `${fileName}.xlsx`);
  } catch (error) {
    console.error("Excel export failed:", error);
    throw error;
  }
}

export async function exportToJSON(data: any[], fileName: string) {
  try {
    const params = new URLSearchParams();
    if (data.length > 0) {
      params.append("startDate", data[0]?.date || "");
      params.append("endDate", data[data.length - 1]?.date || "");
    }

    const response = await fetch(
      `/api/reports/export/json?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error("Failed to export JSON");
    }

    const blob = await response.blob();
    saveAs(blob, `${fileName}.json`);
  } catch (error) {
    console.error("JSON export failed:", error);
    throw error;
  }
}
