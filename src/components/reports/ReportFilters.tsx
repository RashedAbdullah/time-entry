// src/components/reports/ReportFilters.tsx
"use client";

import { useState } from "react";
import { format, subMonths } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
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

interface ReportFiltersProps {
  onFilterChange: (filters: ReportFilters) => void;
}

interface ReportFilters {
  dateRange: "today" | "week" | "month" | "custom";
  startDate?: Date;
  endDate?: Date;
  projectId?: string;
  workspace?: "OFFICE" | "HOME" | "ALL";
}

export function ReportFilters({ onFilterChange }: ReportFiltersProps) {
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
  };

  const getDateRangeForPreset = (preset: string) => {
    const now = new Date();
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

  return (
    <Card>
      <CardContent className="p-4">
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
              <SelectItem value="OFFICE">Office</SelectItem>
              <SelectItem value="HOME">Home</SelectItem>
            </SelectContent>
          </Select>

          {/* Project filter would go here - requires projects data */}
        </div>
      </CardContent>
    </Card>
  );
}
