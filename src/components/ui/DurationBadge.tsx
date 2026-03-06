// src/components/ui/DurationBadge.tsx
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatDuration } from "@/lib/utils/time.utils";

interface DurationBadgeProps {
  duration: number; // in milliseconds
  isActive?: boolean;
  className?: string;
}

export function DurationBadge({
  duration,
  isActive,
  className,
}: DurationBadgeProps) {
  return (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className={cn("gap-1", isActive && "animate-pulse", className)}
    >
      <Clock className={cn("h-3 w-3", isActive && "animate-spin")} />
      {formatDuration(duration)}
    </Badge>
  );
}
