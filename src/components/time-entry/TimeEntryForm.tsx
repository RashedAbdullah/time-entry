"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useProjects } from "@/hooks/useProjects";
import { ProjectSelector } from "@/components/projects/ProjectSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import {
  timeEntrySchema,
  type TimeEntryFormData,
} from "@/lib/validations/time-entry.schema";
import { format } from "date-fns";
import { toast } from "sonner";

interface TimeEntryFormProps {
  date?: Date;
}

export function TimeEntryForm({ date = new Date() }: TimeEntryFormProps) {
  const { createEntry, isLoading } = useTimeEntries();
  const { projects } = useProjects();

  const form = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      startDateTime: "",
      endTime: "",
      description: "",
      workspace: "OFFICE",
      date,
      excluded: false,
    },
  });

  useEffect(() => {
    form.setValue("date", date);
  }, [date, form]);

  const onSubmit = async (data: TimeEntryFormData) => {
    try {
      await createEntry({
        ...data,
        date: format(data.date, "yyyy-MM-dd"),
        projectId: data.projectId || null,
      });
      toast.success("Time entry added");
      form.reset({
        startDateTime: "",
        endTime: "",
        description: "",
        workspace: "OFFICE",
        date,
        excluded: false,
        projectId: "",
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to create entry");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="startDateTime"
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
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

        <FormField
          control={form.control}
          name="excluded"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Exclude from totals</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Keep this entry logged but leave it out of worked hours &amp;
                  salary calculations
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            Add Entry
          </Button>
        </div>
      </form>
    </Form>
  );
}
