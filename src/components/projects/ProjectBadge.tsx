"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FolderKanban } from "lucide-react";

interface ProjectBadgeProps {
  project: {
    id: string;
    name: string;
    type: "PERSONAL" | "OFFICE" | "CLIENT";
  };
  className?: string;
}

const typeColors = {
  PERSONAL: "bg-purple-100 text-purple-700 border-purple-200",
  OFFICE: "bg-blue-100 text-blue-700 border-blue-200",
  CLIENT: "bg-green-100 text-green-700 border-green-200",
};

const typeIcons = {
  PERSONAL: "👤",
  OFFICE: "🏢",
  CLIENT: "🤝",
};

export function ProjectBadge({ project, className }: ProjectBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-normal", typeColors[project.type], className)}
    >
      <span>{typeIcons[project.type]}</span>
      <span>{project.name}</span>
    </Badge>
  );
}
