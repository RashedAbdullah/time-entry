"use client";

import { useMonthlyReport } from "@/hooks/useMonthlyReport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectBadge } from "@/components/projects/ProjectBadge";
import { formatDuration } from "@/lib/utils/time.utils";
import { TrendingUp, TrendingDown, Clock, FolderKanban } from "lucide-react";

interface MonthlySummaryProps {
  year: number;
  month: number;
}

export function MonthlySummary({ year, month }: MonthlySummaryProps) {
  const { summary, isLoading, error } = useMonthlyReport(year, month);

  if (isLoading) {
    return <MonthlySummarySkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-destructive">
          Failed to load monthly summary
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const totalHours = summary.totalDuration / (1000 * 60 * 60);
  const averagePerDay =
    summary.totalDuration / summary.daysWithEntries / (1000 * 60 * 60);
  const previousMonthComparison = summary.compareWithPreviousMonth;

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Across {summary.daysWithEntries} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averagePerDay.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">Per working day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">vs Last Month</CardTitle>
            {previousMonthComparison >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${previousMonthComparison >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {previousMonthComparison >= 0 ? "+" : ""}
              {previousMonthComparison.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Compared to previous month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Projects Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {summary.projects.map((project) => {
            const percentage = (project.duration / summary.totalDuration) * 100;

            return (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ProjectBadge project={project} />
                    <span className="text-sm text-muted-foreground">
                      {project.entryCount} entries
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatDuration(project.duration)}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}

          {summary.projects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No projects this month</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workspace Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workspace Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm">Office</span>
              </div>
              <p className="text-2xl font-bold">
                {formatDuration(summary.workspaceStats.OFFICE || 0)}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm">Home</span>
              </div>
              <p className="text-2xl font-bold">
                {formatDuration(summary.workspaceStats.HOME || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MonthlySummarySkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
