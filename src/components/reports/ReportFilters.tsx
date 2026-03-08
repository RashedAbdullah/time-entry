"use client";

import { useState } from "react";
import { format, subMonths } from "date-fns";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";

interface ReportFiltersProps {
  onFilterChange: (filters: ReportFilters) => void;
  onApply: () => void;
  isLoading?: boolean;
}

interface ReportFilters {
  dateRange: "today" | "week" | "month" | "custom";
  startDate?: Date;
  endDate?: Date;
  projectId?: string;
  workspace?: "OFFICE" | "HOME" | "ALL";
}

export function ReportFilters({
  onFilterChange,
  onApply,
  isLoading,
}: ReportFiltersProps) {
  const { projects } = useProjects();
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: "month",
    workspace: "ALL",
  });
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };

    if (key === "dateRange") {
      if (value === "custom") {
        newFilters.startDate = dateRange.from;
        newFilters.endDate = dateRange.to;
      } else {
        const dates = getDateRangeForPreset(value);
        newFilters.startDate = dates.start;
        newFilters.endDate = dates.end;
      }
    }

    setFilters(newFilters);
    onFilterChange(newFilters);

    // Track active filters
    const active = [];
    if (newFilters.dateRange !== "month") active.push("dateRange");
    if (newFilters.projectId) active.push("project");
    if (newFilters.workspace && newFilters.workspace !== "ALL")
      active.push("workspace");
    setActiveFilters(active);
  };

  const getDateRangeForPreset = (preset: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (preset) {
      case "today":
        return { start: now, end: now };
      case "week":
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return { start: weekAgo, end: now };
      case "month":
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return { start: monthAgo, end: now };
      default:
        return { start: now, end: now };
    }
  };

  const clearFilters = () => {
    const defaultFilters = {
      dateRange: "month",
      workspace: "ALL",
      projectId: undefined,
    };
    setFilters(defaultFilters);
    setDateRange({
      from: subMonths(new Date(), 1),
      to: new Date(),
    });
    setActiveFilters([]);
    onFilterChange(defaultFilters);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.dateRange}
              onValueChange={(value) => handleFilterChange("dateRange", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>

            {filters.dateRange === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range as any);
                      if (range?.from && range?.to) {
                        handleFilterChange("startDate", range.from);
                        handleFilterChange("endDate", range.to);
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}

            <Select
              value={filters.workspace}
              onValueChange={(value) => handleFilterChange("workspace", value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Workspace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All workspaces</SelectItem>
                <SelectItem value="OFFICE">🏢 Office</SelectItem>
                <SelectItem value="HOME">🏠 Home</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.projectId || "ALL"}
              onValueChange={(value) =>
                handleFilterChange(
                  "projectId",
                  value === "ALL" ? undefined : value,
                )
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All projects</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={onApply} disabled={isLoading}>
              {isLoading ? "Generating..." : "Apply Filters"}
            </Button>
          </div>

          {/* Active filters badges */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {activeFilters.includes("dateRange") && (
                <Badge variant="secondary" className="gap-1">
                  Date:{" "}
                  {filters.dateRange === "today"
                    ? "Today"
                    : filters.dateRange === "week"
                      ? "Last 7 days"
                      : filters.dateRange === "month"
                        ? "Last 30 days"
                        : "Custom"}
                </Badge>
              )}
              {filters.projectId && (
                <Badge variant="secondary" className="gap-1">
                  Project:{" "}
                  {projects?.find((p) => p.id === filters.projectId)?.name}
                </Badge>
              )}
              {filters.workspace && filters.workspace !== "ALL" && (
                <Badge variant="secondary" className="gap-1">
                  Workspace: {filters.workspace}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
