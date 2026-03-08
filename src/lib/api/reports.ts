const API_BASE = "/api";

export const api = {
  async getMonthlyReport(year: number, month: number) {
    const res = await fetch(
      `${API_BASE}/reports/monthly?month=${year}-${month}`,
    );
    if (!res.ok) throw new Error("Failed to fetch monthly report");
    return res.json();
  },

  async exportReport(format: "pdf" | "excel", filters: any) {
    const res = await fetch(`${API_BASE}/reports/export/${format}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters),
    });
    if (!res.ok) throw new Error("Failed to export report");
    return res.blob();
  },
};
