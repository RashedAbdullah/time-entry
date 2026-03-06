"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ProjectBadge } from "./ProjectBadge";
import { QuickProjectModal } from "./QuickProjectModal";

interface ProjectSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  projects: any[];
}

export function ProjectSelector({
  value,
  onChange,
  projects,
}: ProjectSelectorProps) {
  const [open, setOpen] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const selectedProject = projects?.find((p) => p.id === value);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedProject ? (
              <ProjectBadge project={selectedProject} />
            ) : (
              <span className="text-muted-foreground">Select project...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search projects..." />
            <CommandEmpty>No project found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="text-muted-foreground">No project</span>
              </CommandItem>
              {projects?.map((project) => (
                <CommandItem
                  key={project.id}
                  onSelect={() => {
                    onChange(project.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === project.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <ProjectBadge project={project} />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setShowProjectModal(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create new project
              </CommandItem>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <QuickProjectModal
        open={showProjectModal}
        onOpenChange={setShowProjectModal}
        onSuccess={(projectId) => {
          onChange(projectId);
        }}
      />
    </>
  );
}
