import useSWR from "swr";
import { api } from "@/lib/api/reports";

export function useMonthlyReport(year: number, month: number) {
  const { data, error } = useSWR(["/api/reports/monthly", year, month], () =>
    api.getMonthlyReport(year, month),
  );

  const formatSummary = (data: any) => {
    if (!data) return null;

    // Calculate workspace distribution
    const workspaceStats = data.entries.reduce((acc: any, entry: any) => {
      acc[entry.workspace] = (acc[entry.workspace] || 0) + entry.duration;
      return acc;
    }, {});

    // Calculate projects breakdown
    const projectMap = new Map();
    data.entries.forEach((entry: any) => {
      if (entry.project) {
        const projectId = entry.project.id;
        if (!projectMap.has(projectId)) {
          projectMap.set(projectId, {
            ...entry.project,
            duration: 0,
            entryCount: 0,
          });
        }
        const project = projectMap.get(projectId);
        project.duration += entry.duration;
        project.entryCount += 1;
      }
    });

    const daysWithEntries = new Set(
      data.entries.map((e: any) => new Date(e.date).toDateString()),
    ).size;

    const totalDuration = data.entries.reduce(
      (sum: number, e: any) => sum + e.duration,
      0,
    );

    return {
      totalDuration,
      daysWithEntries,
      projects: Array.from(projectMap.values()),
      workspaceStats,
      compareWithPreviousMonth: data.compareWithPreviousMonth || 0,
    };
  };

  return {
    summary: data ? formatSummary(data) : null,
    entries: data?.entries || [],
    isLoading: !error && !data,
    error,
  };
}
