// src/components/calendar/EntryDetailPopover.tsx
'use client';

import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProjectBadge } from '@/components/projects/ProjectBadge';
import { WorkspaceIcon } from '@/components/ui/WorkspaceIcon';
import { DurationBadge } from '@/components/ui/DurationBadge';
import { Pencil, Plus } from 'lucide-react';

interface EntryDetailPopoverProps {
  date: Date;
  entries: any[];
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EntryDetailPopover({
  date,
  entries,
  children,
  open,
  onOpenChange,
}: EntryDetailPopoverProps) {
  const router = useRouter();

  const totalDuration = entries.reduce((total, entry) => {
    if (entry.endTime) {
      return total + (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime());
    }
    return total;
  }, 0);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">{format(date, 'EEEE')}</h4>
              <p className="text-sm text-muted-foreground">
                {format(date, 'MMMM d, yyyy')}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                router.push(`/time-entries/new?date=${format(date, 'yyyy-MM-dd')}`);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {entries.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm font-medium">Total:</span>
              <DurationBadge duration={totalDuration} />
            </div>
          )}
        </div>

        <ScrollArea className="max-h-[300px]">
          {entries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No entries for this day
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer group"
                  onClick={() => {
                    onOpenChange(false);
                    router.push(`/time-entries/${entry.id}`);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {entry.project && (
                          <ProjectBadge project={entry.project} />
                        )}
                        <WorkspaceIcon type={entry.workspace} />
                      </div>

                      {entry.description && (
                        <p className="text-sm line-clamp-2">{entry.description}</p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {format(new Date(entry.startTime), 'HH:mm')}
                          {entry.endTime && ` - ${format(new Date(entry.endTime), 'HH:mm')}`}
                        </span>
                        {entry.endTime && (
                          <>
                            <span>•</span>
                            <DurationBadge
                              duration={new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChange(false);
                        router.push(`/time-entries/${entry.id}/edit`);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}