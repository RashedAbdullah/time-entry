"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProjects } from "@/hooks/useProjects";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import {
  timeEntrySchema,
  type TimeEntryFormData,
} from "@/lib/validations/time-entry.schema";
import { ProjectSelector } from "../projects/ProjectSelector";
import { format } from "date-fns";
import { useEffect } from "react";
import { dateToTimeString } from "@/lib/date-formatters";
import { toast } from "sonner";

interface TimeEntry extends TimeEntryFormData {
  id: string;
}

const EntryModal = ({
  open,
  onOpenChange,
  date,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  defaultValues?: TimeEntry;
}) => {
  const { createEntry, updateEntry, isLoading } = useTimeEntries();
  const { projects } = useProjects();

  const form = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      startTime: dateToTimeString(defaultValues?.startTime || "") || "",
      endTime: dateToTimeString(defaultValues?.endTime || "") || "",
      description: defaultValues?.description || "",
      workspace: defaultValues?.workspace || "OFFICE",
      date: defaultValues?.date || date,
      projectId: defaultValues?.projectId || "",
    },
  });

  const onSubmit = async (data: TimeEntryFormData) => {
    try {
      console.log("Submit");
      if (defaultValues?.id) {
        await updateEntry(defaultValues.id, data);
        toast.success("Time entry updated successfully");
      } else {
        await createEntry(data);
        toast.success("Time entry created successfully");
      }
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create or update time entry");
    }
  };

  useEffect(() => {
    if (open && defaultValues?.id) {
      form.reset({
        startTime: dateToTimeString(defaultValues?.startTime || "") || "",
        endTime: dateToTimeString(defaultValues?.endTime || "") || "",
        description: defaultValues?.description || "",
        workspace: defaultValues?.workspace || "OFFICE",
        date: defaultValues?.date || date,
        projectId: defaultValues?.projectId || "",
      });
    } else if (open && !defaultValues?.id) {
      form.reset({
        startTime: "",
        endTime: "",
        description: "",
        workspace: "OFFICE",
        date: date,
        projectId: "",
      });
    }
  }, [defaultValues, date]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {defaultValues?.id ? "Edit Time Entry" : "Add Time Entry"}
          </DialogTitle>
          <DialogDescription>
            {defaultValues?.id ? "Edit" : "Add"} a time entry for{" "}
            {format(date, "EEEE, MMMM d, yyyy")}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <FormControl>
                    <ProjectSelector
                      value={field.value}
                      onChange={field.onChange}
                      projects={projects}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What are you working on?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workspace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select workspace" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="OFFICE">🏢 Office</SelectItem>
                      <SelectItem value="HOME">🏠 Home</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : defaultValues?.id ? (
                  "Update Entry"
                ) : (
                  "Add Entry"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EntryModal;
