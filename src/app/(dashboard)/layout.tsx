import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <TooltipProvider>{children}</TooltipProvider>
    </div>
  );
};

export default DashboardLayout;
