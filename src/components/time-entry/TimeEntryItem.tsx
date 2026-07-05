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
import { Pencil, Clock, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddEditEntryModal } from "../modals/add-edit-entry.modal";
import { useConfirmDialog } from "@/hooks/confirm-dialog-provider";
import { toast } from "sonner";
import { toDisplayDate } from "@/lib/date-formatters";
import { EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeEntryItemProps {
  entry: any;
}

export function TimeEntryItem({ entry }: TimeEntryItemProps) {
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { deleteEntry, updateEntry } = useTimeEntries();

  const duration = entry.endTime
    ? new Date(entry.endTime).getTime() - new Date(entry.startDateTime).getTime()
    : Date.now() - new Date(entry.startDateTime).getTime();

  const confirm = useConfirmDialog();

  const handleDelete = async () => {
    try {
      const ok = await confirm({
        title: "Delete",
        description: "Are you sure you want to delete it?",
        confirmText: "Yes",
        cancelText: "No",
      });
      if (!ok) return;
      await deleteEntry(entry.id);
      toast.success("Successfully Deleted");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete");
    }
  };

  const handleToggleExcluded = async () => {
    try {
      await updateEntry(entry.id, { excluded: !entry.excluded });
      toast.success(
        entry.excluded ? "Entry included in totals" : "Entry excluded from totals",
      );
    } catch (error: any) {
      toast.error(error?.message || "Failed to update entry");
    }
  };

  return (
    <>
      <AddEditEntryModal
        date={entry.date}
        onOpenChange={setIsEditing}
        open={isEditing}
        defaultValues={entry}
        onSuccess={() => setIsEditing(false)}
      />
      <Card
        className={cn(
          "p-3 hover:shadow-md transition-shadow",
          entry.excluded && "opacity-60",
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {entry.project && <ProjectBadge project={entry.project} />}
              <WorkspaceIcon type={entry.workspace} />
              <span className="text-xs text-muted-foreground font-mono">
                {format(toDisplayDate(entry.startDateTime), "hh:mm a")}
                {entry.endTime &&
                  ` - ${format(toDisplayDate(entry.endTime), "hh:mm a")}`}
              </span>
              {entry.excluded && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground border rounded-full px-2 py-0.5">
                  <EyeOff className="h-3 w-3" />
                  Excluded
                </span>
              )}
            </div>

            {entry.description && (
              <p className="text-sm">{entry.description}</p>
            )}

            <div className="flex items-center gap-2">
              <DurationBadge duration={duration} isActive={!entry.endTime} />

              {entry.adjustments?.length > 0 && (
                <span className="text-xs text-muted-foreground font-mono">
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
              <DropdownMenuItem onClick={handleToggleExcluded}>
                <EyeOff className="h-4 w-4 mr-2" />
                {entry.excluded ? "Include in totals" : "Exclude from totals"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2 text-destructive" />
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
