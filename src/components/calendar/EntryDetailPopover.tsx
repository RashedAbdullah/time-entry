"use client";

import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectBadge } from "@/components/projects/ProjectBadge";
import { WorkspaceIcon } from "@/components/ui/WorkspaceIcon";
import { DurationBadge } from "@/components/ui/DurationBadge";
import { Pencil, Plus, Trash2, Clock } from "lucide-react";
import { useState } from "react";
import { AddEditEntryModal } from "../modals/add-edit-entry.modal";
import { api } from "@/lib/api/time-entries";
import { useConfirmDialog } from "@/hooks/confirm-dialog-provider";
import { toast } from "sonner";
import { TimeAdjustmentModal } from "@/components/time-entry/TimeAdjustmentModal";

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
  const [openModal, setOpenModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [openAdjustmentModal, setOpenAdjustmentModal] = useState(false);
  const [adjustmentEntryId, setAdjustmentEntryId] = useState<any>(null);

  const totalDuration = entries.reduce((total, entry) => {
    if (entry.endTime) {
      return (
        total +
        (new Date(entry.endTime).getTime() -
          new Date(entry.startTime).getTime())
      );
    }
    return total;
  }, 0);

  const handleEditEntry = (id: any) => {
    const entry = entries.find((entry) => entry.id === id);

    setSelectedEntry(entry);
    onOpenChange(false);
    setOpenModal(true);
  };

  const confirm = useConfirmDialog();
  const handleDeleteEntry = async (id: any) => {
    try {
      const ok = await confirm({
        title: "Delete Entry",
        description: "Are you sure you want to delete this entry?",
      });
      if (!ok) return;
      await api.deleteEntry(id);
      api.getEntries();
      toast.success("Entry deleted successfully");
    } catch (error) {
      toast.error("Failed to delete entry");
      console.log(error);
    }
  };

  const handleAdjustTime = (id: any) => {
    setAdjustmentEntryId(id);
    onOpenChange(false);
    setOpenAdjustmentModal(true);
  };

  return (
    <>
      <AddEditEntryModal
        open={openModal}
        onOpenChange={setOpenModal}
        date={date}
        defaultValues={selectedEntry}
        onSuccess={() => {
          setSelectedEntry(null);
          setOpenModal(false);
          api.getEntries();
        }}
      />
      {adjustmentEntryId && (
        <TimeAdjustmentModal
          open={openAdjustmentModal}
          onOpenChange={(isOpen) => {
            setOpenAdjustmentModal(isOpen);
            if (!isOpen) {
              setAdjustmentEntryId(null);
              api.getEntries();
            }
          }}
          entryId={adjustmentEntryId}
        />
      )}
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{format(date, "EEEE")}</h4>
                <p className="text-sm text-muted-foreground">
                  {format(date, "MMMM d, yyyy")}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedEntry(null);
                  onOpenChange(false);
                  setOpenModal(true);
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

          <ScrollArea className="max-h-[300px] overflow-y-auto">
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
                          <p className="text-sm line-clamp-2">
                            {entry.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {format(new Date(entry.startTime), "hh:mm a")}
                            {entry.endTime &&
                              ` - ${format(new Date(entry.endTime), "hh:mm a")}`}
                          </span>
                          {entry.endTime && (
                            <>
                              <span>•</span>
                              <DurationBadge
                                duration={
                                  new Date(entry.endTime).getTime() -
                                  new Date(entry.startTime).getTime()
                                }
                              />
                            </>
                          )}

                          {entry.adjustments?.length > 0 && (
                            <span className="text-xs text-muted-foreground ml-2">
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

                      <Button
                        title="Adjust Time"
                        size="icon"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 h-8 w-8"
                        onClick={() => handleAdjustTime(entry?.id)}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>

                      <Button
                        title="Edit Entry"
                        size="icon"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 h-8 w-8"
                        onClick={() => handleEditEntry(entry?.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        title="Delete Entry"
                        size="icon"
                        variant="destructive"
                        className="opacity-0 group-hover:opacity-100 h-8 w-8"
                        onClick={() => handleDeleteEntry(entry?.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </>
  );
}
