import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden">
          {/* <Sidebar isOpen={false} /> */}
          <div className="flex-1 overflow-y-auto">
            <Header />
            <main className="p-6">{children}</main>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default DashboardLayout;
