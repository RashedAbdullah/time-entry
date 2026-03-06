// src/components/calendar/DayCell.tsx
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { EntryDetailPopover } from './EntryDetailPopover';
import { calculateTotalDuration, formatDuration } from '@/lib/utils/time.utils';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface DayCellProps {
  date: Date;
  entries: any[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function DayCell({ date, entries, isCurrentMonth, isToday }: DayCellProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const totalDuration = calculateTotalDuration(entries);
  const hasEntries = entries.length > 0;

  return (
    <EntryDetailPopover
      date={date}
      entries={entries}
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}

    >
      <div
        onClick={() => setIsPopoverOpen(true)}
        className={cn(
          "min-h-[120px] p-2 rounded-lg border cursor-pointer transition-all",
          "hover:shadow-md hover:border-primary",
          !isCurrentMonth && "bg-muted/20 text-muted-foreground",
          isToday && "border-primary border-2",
          hasEntries && "bg-primary/5",
          "flex flex-col"
        )}
      >
        <div className="flex justify-between items-start">
          <span className={cn(
            "text-sm font-medium",
            isToday && "text-primary"
          )}>
            {format(date, 'd')}
          </span>
          {hasEntries && (
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {entries.length}
            </span>
          )}
        </div>

        {hasEntries && (
          <div className="mt-2 space-y-1 flex-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(totalDuration)}</span>
            </div>

            {/* Show first 2 entries preview */}
            <div className="space-y-1">
              {entries.slice(0, 2).map((entry) => (
                <div
                  key={entry.id}
                  className="text-xs truncate rounded px-1 py-0.5 bg-background"
                >
                  {entry.project?.name || 'No project'} - {entry.description?.slice(0, 20)}
                  {entry.description?.length > 20 && '...'}
                </div>
              ))}
              {entries.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{entries.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </EntryDetailPopover>
  );
}