const API_BASE = "/api";

async function parseOrThrow(res: Response, fallbackMessage: string) {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message || fallbackMessage);
  }
  return body;
}

export interface UserSettings {
  monthlyGoalHours: number | null;
  monthlySalary: number | null;
}

export const api = {
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return parseOrThrow(res, "Failed to fetch settings");
  },

  async updateSettings(data: Partial<UserSettings>) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return parseOrThrow(res, "Failed to update settings");
  },
};
