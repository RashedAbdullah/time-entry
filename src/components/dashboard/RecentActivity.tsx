"use client";

import { useTimeEntries } from "@/hooks/useTimeEntries";
import { TimeEntryItem } from "@/components/time-entry/TimeEntryItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { todayDateKey } from "@/lib/date-formatters";

interface RecentActivityProps {
  date?: string;
  isToday?: boolean;
}

export function RecentActivity({
  date = todayDateKey(),
  isToday = true,
}: RecentActivityProps) {
  const { dayEntries, isLoading, error } = useTimeEntries(date);

  if (isLoading && !dayEntries) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-destructive">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>Failed to load entries</span>
      </div>
    );
  }

  if (!dayEntries?.length) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        {isToday
          ? "No entries for today. Start tracking your time!"
          : "No entries for this date."}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3 overflow-y-auto">
        {dayEntries.map((entry: any) => (
          <TimeEntryItem key={entry.id} entry={entry} />
        ))}
      </div>
    </ScrollArea>
  );
}
