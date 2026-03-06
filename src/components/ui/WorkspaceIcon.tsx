"use client";

import { Home, Building2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkspaceIconProps {
  type: "OFFICE" | "HOME";
  showTooltip?: boolean;
  className?: string;
}

export function WorkspaceIcon({
  type,
  showTooltip = true,
  className,
}: WorkspaceIconProps) {
  const icon =
    type === "OFFICE" ? (
      <Building2 className={className} />
    ) : (
      <Home className={className} />
    );

  if (!showTooltip) return icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{icon}</TooltipTrigger>
        <TooltipContent>
          <p>Workspace: {type === "OFFICE" ? "Office" : "Home"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
