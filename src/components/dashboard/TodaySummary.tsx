"use client";

import { useTimeEntries } from "@/hooks/useTimeEntries";
import { formatDuration } from "@/lib/utils/time.utils";
import { Card } from "@/components/ui/card";
import { Clock, Target, TrendingUp } from "lucide-react";

export function TodaySummary() {
  const { todayEntries, isLoading } = useTimeEntries();

  const totalToday =
    todayEntries?.reduce((acc: number, entry: any) => {
      if (entry.endTime) {
        return (
          acc +
          (new Date(entry.endTime).getTime() -
            new Date(entry.startTime).getTime())
        );
      }
      return acc;
    }, 0) || 0;

  const activeEntries = todayEntries?.filter((e: any) => !e.endTime).length || 0;
  const completedEntries = todayEntries?.filter((e: any) => e.endTime).length || 0;

  if (isLoading) {
    return <SummarySkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4 flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-full">
          <Clock className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Today</p>
          <p className="text-2xl font-bold">{formatDuration(totalToday)}</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center space-x-4">
        <div className="p-3 bg-green-100 rounded-full">
          <Target className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Active Tasks</p>
          <p className="text-2xl font-bold">{activeEntries}</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center space-x-4">
        <div className="p-3 bg-purple-100 rounded-full">
          <TrendingUp className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold">{completedEntries}</p>
        </div>
      </Card>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4 h-24 animate-pulse bg-muted" />
      ))}
    </div>
  );
}
