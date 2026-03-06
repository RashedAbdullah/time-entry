// src/components/time-entry/TimeEntryForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useProjects } from '@/hooks/useProjects';
import { ProjectSelector } from '@/components/projects/ProjectSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { timeEntrySchema, type TimeEntryFormData } from '@/lib/validations/time-entry.schema';
import { Play, Square, Loader2 } from 'lucide-react';

export function TimeEntryForm() {
  const [isTracking, setIsTracking] = useState(false);
  const { createEntry, startTimer, stopTimer, isLoading } = useTimeEntries();
  const { projects } = useProjects();

  const form = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      description: '',
      workspace: 'OFFICE',
      date: new Date(),
    },
  });

  const onSubmit = async (data: TimeEntryFormData) => {
    await createEntry(data);
    form.reset();
  };

  const handleStartTimer = async () => {
    const values = form.getValues();
    if (values.description || values.projectId) {
      await startTimer(values);
      setIsTracking(true);
    }
  };

  const handleStopTimer = async () => {
    await stopTimer();
    setIsTracking(false);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          {!isTracking ? (
            <Button
              type="button"
              onClick={handleStartTimer}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Start Timer
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleStopTimer}
              variant="destructive"
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Timer
            </Button>
          )}

          <Button
            type="submit"
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Log Manually
          </Button>
        </div>
      </form>
    </Form>
  );
}