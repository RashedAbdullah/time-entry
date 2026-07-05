import useSWR from "swr";
import { format } from "date-fns";
import { api } from "@/lib/api/reports";
import { useSettings } from "./useSettings";

// Tracks this month's worked hours + salary earned against the user's goal,
// for the Day tab's progress card.
export function useMonthlyGoalProgress(referenceDate: Date = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth() + 1;
  const monthKey = format(referenceDate, "yyyy-MM");

  const { data, error } = useSWR(`/api/reports/monthly?month=${monthKey}`, () =>
    api.getMonthlyReport(year, month),
  );

  const { settings, hourlyRate, isLoading: settingsLoading } = useSettings();

  const totalMinutes = data?.data?.totalMinutes ?? 0;
  const hoursWorked = totalMinutes / 60;
  const goalHours = settings.monthlyGoalHours;
  const earned = hourlyRate !== null ? hoursWorked * hourlyRate : null;
  const percent =
    goalHours && goalHours > 0
      ? Math.min(100, (hoursWorked / goalHours) * 100)
      : null;

  return {
    isLoading: (!error && !data) || settingsLoading,
    error,
    hoursWorked,
    goalHours,
    salary: settings.monthlySalary,
    hourlyRate,
    earned,
    percent,
    monthKey,
  };
}
