import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/header";
import { ConfirmDialogProvider } from "@/hooks/confirm-dialog-provider";
import { Toaster } from "@/components/ui/sonner";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <TooltipProvider>
        <ConfirmDialogProvider>
          <div className="flex h-screen overflow-hidden">
            <Toaster richColors />
            <div className="flex-1 overflow-y-auto">
              <Header />
              <main className="p-6">{children}</main>
            </div>
          </div>
        </ConfirmDialogProvider>
      </TooltipProvider>
    </div>
  );
};

export default DashboardLayout;
