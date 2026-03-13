// src/lib/utils/time.utils.ts
export function formatDuration(ms: number): string {
  if (ms < 0) return "-" + formatDuration(Math.abs(ms));

  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  if (hours === 0 && minutes === 0) parts.push(`${remainingSeconds}s`);

  return parts.join(" ");
}

export function formatDurationDetailed(ms: number): string {
  if (ms < 0) return "-" + formatDurationDetailed(Math.abs(ms));

  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function parseDuration(duration: string): number {
  // Parse "1h 30m" or "90m" or "1:30" format
  const regex = /(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/i;
  const matches = duration.match(regex);

  if (!matches) return 0;

  const hours = parseInt(matches[1] || "0");
  const minutes = parseInt(matches[2] || "0");
  const seconds = parseInt(matches[3] || "0");

  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

export function calculateTotalDuration(entries: any[]): number {
  return entries.reduce((total, entry) => {
    if (entry.endTime) {
      return (
        total +
        (new Date(entry.endTime).getTime() -
          new Date(entry.startDateTime).getTime())
      );
    }
    return total;
  }, 0);
}

export function calculateAdjustments(adjustments: any[]): number {
  return adjustments.reduce((total, adj) => total + adj.minutes * 60 * 1000, 0);
}

export function getDurationInHours(ms: number): number {
  return Number((ms / (1000 * 60 * 60)).toFixed(2));
}

export function getDurationInMinutes(ms: number): number {
  return Math.round(ms / (1000 * 60));
}

export function groupEntriesByDate(entries: any[]): Record<string, any[]> {
  return entries.reduce((acc: any, entry: any) => {
    const date = new Date(entry.date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});
}

export function groupEntriesByProject(entries: any[]): Record<string, any[]> {
  return entries.reduce((acc: any, entry: any) => {
    const projectId = entry.project?.id || "no-project";
    if (!acc[projectId]) {
      acc[projectId] = {
        project: entry.project,
        entries: [],
        totalDuration: 0,
      };
    }
    acc[projectId].entries.push(entry);
    if (entry.endTime) {
      acc[projectId].totalDuration +=
        new Date(entry.endTime).getTime() - new Date(entry.startDateTime).getTime();
    }
    return acc;
  }, {});
}
