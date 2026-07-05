import useSWR from "swr";
import { useState } from "react";
import { api, type UserSettings } from "@/lib/api/settings";

export function useSettings() {
  const [isSaving, setIsSaving] = useState(false);

  const { data, error, mutate } = useSWR("/api/settings", api.getSettings);

  const settings: UserSettings = data?.data ?? {
    monthlyGoalHours: null,
    monthlySalary: null,
  };

  const updateSettings = async (values: Partial<UserSettings>) => {
    setIsSaving(true);
    try {
      const result = await api.updateSettings(values);
      mutate(result, false);
      return result;
    } finally {
      setIsSaving(false);
    }
  };

  const hourlyRate =
    settings.monthlyGoalHours && settings.monthlySalary
      ? settings.monthlySalary / settings.monthlyGoalHours
      : null;

  return {
    settings,
    hourlyRate,
    isLoading: !error && !data,
    error,
    isSaving,
    updateSettings,
  };
}
