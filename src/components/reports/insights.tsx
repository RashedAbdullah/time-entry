"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { startOfMonth, endOfMonth } from "date-fns";
import { MonthlySummary } from "./MonthlySummary";
import { ReportFilters } from "./ReportFilters";
import { ExportButtons } from "./ExportButtons";
import { ReportChart } from "./ReportChart";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, BarChart3, Table2 } from "lucide-react";

export interface ReportFiltersState {
  startDate: Date;
  endDate: Date;
  projectId?: string;
  workspace?: "OFFICE" | "HOME" | "ALL";
}

const Insights = () => {
  const { data: session } = useSession();
  const [filters, setFilters] = useState<ReportFiltersState>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    workspace: "ALL",
  });
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.startDate)
      params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate)
      params.append("endDate", filters.endDate.toISOString());
    if (filters.projectId) params.append("projectId", filters.projectId);
    if (filters.workspace && filters.workspace !== "ALL")
      params.append("workspace", filters.workspace);

    const controller = new AbortController();

    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/reports?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        setReportData(data);
      } catch (error: any) {
        if (error.name === "AbortError") return;
        console.error("Failed to fetch report data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();

    return () => controller.abort();
  }, [filters]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Analyze your time tracking data
          </p>
        </div>
        {reportData && (
          <ExportButtons
            data={reportData.entries || []}
            fileName={`time-report-${new Date().toISOString().slice(0, 10)}`}
          />
        )}
      </div>

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFilterChange={setFilters}
        isLoading={isLoading}
      />

      {/* Report Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="daily">
            <CalendarDays className="h-4 w-4 mr-2" />
            Daily Breakdown
          </TabsTrigger>
          <TabsTrigger value="table">
            <Table2 className="h-4 w-4 mr-2" />
            Table View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {reportData && (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reportData.summary.totalHours}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across {reportData.summary.totalDays} days
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Daily Average
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reportData.summary.averagePerDay}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per working day
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reportData.summary.totalEntries}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Time entries
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Projects Used
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reportData.summary.totalProjects}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active projects
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Time Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReportChart data={reportData.chartData} />
                </CardContent>
              </Card>
            </>
          )}

          {!reportData && !isLoading && (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No data to display</p>
                <p className="text-sm">Apply filters to generate a report</p>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="h-64 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData?.dailyBreakdown ? (
                <div className="space-y-4">
                  {reportData.dailyBreakdown.map((day: any) => (
                    <div key={day.date} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{day.date}</span>
                        <span className="text-sm font-mono">
                          {day.totalHours}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {day.entries.map((entry: any) => (
                          <div
                            key={entry.id}
                            className="flex justify-between text-sm text-muted-foreground"
                          >
                            <span>
                              {entry.project?.name || "No project"} -{" "}
                              {entry.description || "No description"}
                            </span>
                            <span>{entry.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No daily data available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>All Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData?.entries?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-left py-2 px-4">Project</th>
                        <th className="text-left py-2 px-4">Description</th>
                        <th className="text-left py-2 px-4">Workspace</th>
                        <th className="text-left py-2 px-4">Start</th>
                        <th className="text-left py-2 px-4">End</th>
                        <th className="text-left py-2 px-4">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.entries.map((entry: any) => (
                        <tr
                          key={entry.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="py-2 px-4">{entry.date}</td>
                          <td className="py-2 px-4">
                            {entry.project?.name || "-"}
                          </td>
                          <td className="py-2 px-4">
                            {entry.description || "-"}
                          </td>
                          <td className="py-2 px-4">{entry.workspace}</td>
                          <td className="py-2 px-4">{entry.startTime}</td>
                          <td className="py-2 px-4">{entry.endTime || "-"}</td>
                          <td className="py-2 px-4 font-mono">
                            {entry.duration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No entries found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Insights;
