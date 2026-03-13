"use client";

import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth } from "date-fns";
import { Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ReportFiltersState } from "./insights";

interface ReportFiltersProps {
  filters: ReportFiltersState;
  onFilterChange: (filters: ReportFiltersState) => void;
  isLoading?: boolean;
}

export function ReportFilters({
  filters,
  onFilterChange,
  isLoading,
}: ReportFiltersProps) {
  const { projects } = useProjects();
  
  const handleFilterChange = (key: keyof ReportFiltersState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleMonthChange = (delta: number) => {
    const currentMonthDate = filters.startDate;
    const newMonth = delta > 0 ? addMonths(currentMonthDate, 1) : subMonths(currentMonthDate, 1);
    onFilterChange({
      ...filters,
      startDate: startOfMonth(newMonth),
      endDate: endOfMonth(newMonth),
    });
  };

  const clearFilters = () => {
    onFilterChange({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
      workspace: "ALL",
      projectId: undefined,
    });
  };

  const activeFiltersCount = 
    (filters.projectId ? 1 : 0) + 
    (filters.workspace && filters.workspace !== "ALL" ? 1 : 0) + 
    (!isSameMonth(filters.startDate, new Date()) ? 1 : 0);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Month Navigator */}
            <div className="flex items-center gap-2 border rounded-md p-1 h-10 w-[200px] justify-between shadow-sm bg-background">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMonthChange(-1)}
                disabled={isLoading}
                className="h-7 w-7 rounded-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium w-full text-center">
                {format(filters.startDate, "MMMM yyyy")}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMonthChange(1)}
                disabled={isLoading}
                className="h-7 w-7 rounded-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

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
                {projects?.map((project: any) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active filters badges */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {!isSameMonth(filters.startDate, new Date()) && (
                <Badge variant="secondary" className="gap-1">
                  Month: {format(filters.startDate, "MMM yyyy")}
                </Badge>
              )}
              {filters.projectId && (
                <Badge variant="secondary" className="gap-1">
                  Project:{" "}
                  {projects?.find((p: any) => p.id === filters.projectId)?.name}
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
