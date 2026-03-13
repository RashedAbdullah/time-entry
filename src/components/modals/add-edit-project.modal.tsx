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
import { useEffect } from "react";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(50),
  description: z.string().max(200).optional(),
  type: z.enum(["PERSONAL", "OFFICE", "CLIENT"]),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface QuickProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (projectId: string) => void;
  defaultValues?: any;
}

export function AddEditProjectModal({
  open,
  onOpenChange,
  onSuccess,
  defaultValues,
}: QuickProjectModalProps) {
  const { createProject, updateProject, isCreating } = useProjects();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      type: defaultValues?.type || "OFFICE",
    },
  });

  useEffect(() => {
    if (defaultValues?.id && open) {
      form.reset({
        name: defaultValues.name,
        description: defaultValues.description,
        type: defaultValues.type,
      });
    } else if (!defaultValues?.id && open) {
      form.reset({
        name: "",
        description: "",
        type: "OFFICE",
      });
    }
  }, [defaultValues, form]);

  const onSubmit = async (data: ProjectFormData) => {
    try {
      if (defaultValues?.id) {
        await updateProject(defaultValues?.id, data);
        onSuccess?.(defaultValues?.id);
      } else {
        const project = await createProject(data);
        onSuccess?.(project.id);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {defaultValues?.id ? "Update Project" : "Create New Project"}
          </DialogTitle>
          <DialogDescription>
            {defaultValues?.id ? "Update Project" : "Add a new project"} to
            organize your time entries.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Website Redesign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PERSONAL">👤 Personal</SelectItem>
                      <SelectItem value="OFFICE">🏢 Office</SelectItem>
                      <SelectItem value="CLIENT">🤝 Client</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the project"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {defaultValues?.id ? "Update Project" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
