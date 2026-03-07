// src/components/time-entry/TimeEntryItem.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { TimeAdjustmentModal } from "./TimeAdjustmentModal";
import { ProjectBadge } from "@/components/projects/ProjectBadge";
import { DurationBadge } from "@/components/ui/DurationBadge";
import { WorkspaceIcon } from "@/components/ui/WorkspaceIcon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Clock, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EntryModal from "../modals/entry.modal";

interface TimeEntryItemProps {
  entry: any;
}

export function TimeEntryItem({ entry }: TimeEntryItemProps) {
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { updateEntry, deleteEntry } = useTimeEntries();

  const duration = entry.endTime
    ? new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()
    : Date.now() - new Date(entry.startTime).getTime();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this entry?")) {
      await deleteEntry(entry.id);
    }
  };

  return (
    <>
      <EntryModal
        date={entry.date}
        onOpenChange={setIsEditing}
        open={isEditing}
        defaultValues={entry}
        onSuccess={() => setIsEditing(false)}
      />
      <Card className="p-3 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {entry.project && <ProjectBadge project={entry.project} />}
              <WorkspaceIcon type={entry.workspace} />
              <span className="text-xs text-muted-foreground">
                {format(new Date(entry.startTime), "HH:mm")}
                {entry.endTime &&
                  ` - ${format(new Date(entry.endTime), "HH:mm")}`}
              </span>
            </div>

            {entry.description && (
              <p className="text-sm">{entry.description}</p>
            )}

            <div className="flex items-center gap-2">
              <DurationBadge duration={duration} isActive={!entry.endTime} />

              {entry.adjustments?.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  (Adjusted:{" "}
                  {entry.adjustments.reduce(
                    (acc: number, adj: any) => acc + adj.minutes,
                    0,
                  )}{" "}
                  min)
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowAdjustment(true)}>
                <Clock className="h-4 w-4 mr-2" />
                Adjust Time
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <TimeAdjustmentModal
        open={showAdjustment}
        onOpenChange={setShowAdjustment}
        entryId={entry.id}
      />
    </>
  );
}
