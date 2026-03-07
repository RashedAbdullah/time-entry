"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { RecentActivity } from "./RecentActivity";
import { MonthView } from "@/components/calendar/MonthView";
import { TimeEntryForm } from "@/components/time-entry/TimeEntryForm";
import { ActiveTimer } from "@/components/time-entry/ActiveTimer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import Projects from "../projects/projects";

export function DashboardContainer() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("today");

  if (!session) return null;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Welcome back, {session.user.name}
        </h1>
        <ActiveTimer />
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="monthly-report">Monthy Report</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
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

        <TabsContent value="calendar">
          <Card className="p-4">
            <MonthView />
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="p-4">
            {/* Report components will go here */}
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              Reports view coming soon
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="projects">
          <Card className="p-4">
            <Projects />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
