"use client";

import { useTimeEntries } from "@/hooks/useTimeEntries";
import { TimeEntryItem } from "@/components/time-entry/TimeEntryItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export function RecentActivity() {
  const { todayEntries, isLoading, error } = useTimeEntries();

  if (isLoading) {
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

  if (!todayEntries?.length) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No entries for today. Start tracking your time!
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3 overflow-y-auto">
        {todayEntries.map((entry: any) => (
          <TimeEntryItem key={entry.id} entry={entry} />
        ))}
      </div>
    </ScrollArea>
  );
}
