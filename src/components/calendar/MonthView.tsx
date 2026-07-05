"use client";

import { useState } from "react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import { useMonthEntries } from "@/hooks/useTimeEntries";
import { DayCell } from "./DayCell";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calculateTotalDuration, formatDuration } from "@/lib/utils/time.utils";
import { dateKey } from "@/lib/date-formatters";

interface MonthViewProps {
  onSelectDay?: (date: Date) => void;
}

export function MonthView({ onSelectDay }: MonthViewProps = {}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { entries } = useMonthEntries(format(currentMonth, "yyyy-MM"));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Group entries by date (using the UTC-stored calendar day so grouping is
  // correct regardless of the viewer's local timezone)
  const entriesByDate = entries?.reduce((acc: any, entry: any) => {
    const date = dateKey(entry.date);
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  const totalDuration = calculateTotalDuration(entries || []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {format(currentMonth, "MMMM yyyy")} - {formatDuration(totalDuration)}
        </h2>
        <div className="flex gap-2">
          <Button
            title="Previous Month"
            variant="outline"
            size="icon"
            onClick={prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            title="Next Month"
            variant="outline"
            size="icon"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-${index}`} className="min-h-[120px] bg-muted/20" />
        ))}

        {/* Month days */}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayEntries = entriesByDate?.[dateStr] || [];

          return (
            <DayCell
              key={dateStr}
              date={day}
              entries={dayEntries}
              isCurrentMonth={isSameMonth(day, currentMonth)}
              isToday={isToday(day)}
              onSelectDay={onSelectDay}
            />
          );
        })}
      </div>
    </div>
  );
}
