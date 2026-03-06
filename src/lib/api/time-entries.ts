const API_BASE = "/api";

const date = new Date().toISOString().split("T")[0];

export const api = {
  async getTodayEntries() {
    const res = await fetch(`${API_BASE}/time-entries?date=${date}`);
    if (!res.ok) throw new Error("Failed to fetch today entries");
    return res.json();
  },

  async getActiveEntry() {
    const res = await fetch(`${API_BASE}/time-entries/active`);
    if (!res.ok) throw new Error("Failed to fetch active entry");
    return res.json();
  },

  async createEntry(data: any) {
    const res = await fetch(`${API_BASE}/time-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create entry");
    return res.json();
  },

  async startTimer(data: any) {
    const res = await fetch(`${API_BASE}/time-entries/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to start timer");
    return res.json();
  },

  async stopTimer() {
    const res = await fetch(`${API_BASE}/time-entries/stop`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to stop timer");
    return res.json();
  },

  async updateEntry(id: string, data: any) {
    const res = await fetch(`${API_BASE}/time-entries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update entry");
    return res.json();
  },

  async deleteEntry(id: string) {
    const res = await fetch(`${API_BASE}/time-entries/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete entry");
    return res.json();
  },

  async adjustTime(entryId: string, data: any) {
    const res = await fetch(`${API_BASE}/time-entries/adjustments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, timeEntryId: entryId }),
    });
    if (!res.ok) throw new Error("Failed to adjust time");
    return res.json();
  },

  async getEntries() {
    const res = await fetch(`${API_BASE}/time-entries`);
    if (!res.ok) throw new Error("Failed to fetch entries");
    return res.json();
  },
};
