"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { RecentActivity } from "./RecentActivity";
import { MonthView } from "@/components/calendar/MonthView";
import { TimeEntryForm } from "@/components/time-entry/TimeEntryForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import Projects from "../projects/projects";
import Reports from "../reports/reports";
import { BarChart3, CalendarDays, FolderOpen, Sun } from "lucide-react";
import { AnimatePresence } from "motion/react";

export function DashboardContainer() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("today");

  if (!session) return null;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="mb-8 hidden md:inline-flex h-11 bg-secondary/60 p-1 gap-0.5">
          <TabsTrigger
            value="today"
            className="gap-2 rounded-lg px-4 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-card data-[state=active]:text-foreground transition-all duration-200"
          >
            <Sun /> Today
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="gap-2 rounded-lg px-4 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-card data-[state=active]:text-foreground transition-all duration-200"
          >
            <CalendarDays />
            Calendar
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="gap-2 rounded-lg px-4 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-card data-[state=active]:text-foreground transition-all duration-200"
          >
            <FolderOpen />
            Projects
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="gap-2 rounded-lg px-4 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-card data-[state=active]:text-foreground transition-all duration-200"
          >
            <BarChart3 />
            Insights
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="today" className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Time Entry Form */}
              <Card className="lg:col-span-1 p-4">
                <h2 className="text-lg font-semibold mb-4">
                  New Time Entry ({new Date().toLocaleDateString()})
                </h2>
                <TimeEntryForm />
              </Card>

              {/* Today's Entries */}
              <Card className="lg:col-span-2 p-4">
                <h2 className="text-lg font-semibold mb-4">Today's Entries</h2>
                <RecentActivity />
              </Card>
            </div>
          </TabsContent>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <TabsContent value="calendar" className="animate-fade-in">
            <Card className="p-4">
              <MonthView />
            </Card>
          </TabsContent>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <TabsContent value="reports" className="animate-fade-in">
            <Card className="p-4">
              <Reports />
            </Card>
          </TabsContent>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <TabsContent value="projects" className="animate-fade-in">
            <Card className="p-4">
              <Projects />
            </Card>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
