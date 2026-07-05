"use client";

import { useMonthlyGoalProgress } from "@/hooks/useMonthlyGoalProgress";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Wallet } from "lucide-react";
import Link from "next/link";

export function GoalProgressCard() {
  const { isLoading, hoursWorked, goalHours, salary, earned, percent } =
    useMonthlyGoalProgress();

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  if (!goalHours) {
    return (
      <Card className="p-4 flex flex-col justify-center items-center text-center gap-2 h-full">
        <Target className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Set a monthly hour goal &amp; salary to track your progress here.
        </p>
        <Link
          href="/?tab=settings"
          className="text-xs font-medium text-primary underline underline-offset-2"
        >
          Go to Settings
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Target className="h-4 w-4 text-primary" />
          Monthly goal
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {hoursWorked.toFixed(1)}h / {goalHours}h
        </span>
      </div>

      <Progress value={percent ?? 0} className="h-2.5" />

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-sm">
          <Wallet className="h-4 w-4 text-accent" />
          <span className="text-muted-foreground">Earned so far</span>
        </div>
        <span className="font-mono font-semibold text-accent">
          {salary && earned !== null ? earned.toFixed(2) : "—"}
        </span>
      </div>
    </Card>
  );
}
