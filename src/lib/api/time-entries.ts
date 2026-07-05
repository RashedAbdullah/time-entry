import { todayDateKey } from "@/lib/date-formatters";

const API_BASE = "/api";

async function parseOrThrow(res: Response, fallbackMessage: string) {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message || fallbackMessage);
  }
  return body;
}

export const api = {
  async getEntriesByDate(date: string = todayDateKey()) {
    const res = await fetch(`${API_BASE}/time-entries?date=${date}`);
    return parseOrThrow(res, "Failed to fetch entries for this date");
  },

  async getEntriesByMonth(monthKey: string) {
    const res = await fetch(
      `${API_BASE}/time-entries?month=${monthKey}&limit=500`,
    );
    return parseOrThrow(res, "Failed to fetch entries for this month");
  },

  async createEntry(data: any) {
    const res = await fetch(`${API_BASE}/time-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return parseOrThrow(res, "Failed to create entry");
  },

  async updateEntry(id: string, data: any) {
    const res = await fetch(`${API_BASE}/time-entries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return parseOrThrow(res, "Failed to update entry");
  },

  async deleteEntry(id: string) {
    const res = await fetch(`${API_BASE}/time-entries/${id}`, {
      method: "DELETE",
    });
    return parseOrThrow(res, "Failed to delete entry");
  },

  async adjustTime(entryId: string, data: any) {
    const res = await fetch(`${API_BASE}/time-entries/adjustments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, timeEntryId: entryId }),
    });
    return parseOrThrow(res, "Failed to adjust time");
  },

  async getEntries() {
    const res = await fetch(`${API_BASE}/time-entries?limit=1000`);
    return parseOrThrow(res, "Failed to fetch entries");
  },
};
