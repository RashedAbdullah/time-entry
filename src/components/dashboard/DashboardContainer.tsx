"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format, isToday as isDateToday } from "date-fns";
import { RecentActivity } from "./RecentActivity";
import { GoalProgressCard } from "./GoalProgressCard";
import { MonthView } from "@/components/calendar/MonthView";
import { TimeEntryForm } from "@/components/time-entry/TimeEntryForm";
import { DatePicker } from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import Projects from "../projects/projects";
import Insights from "../reports/insights";
import { SettingsForm } from "@/components/settings/SettingsForm";
import {
  BarChart3,
  CalendarDays,
  FolderOpen,
  Sun,
  Settings as SettingsIcon,
} from "lucide-react";
import { AnimatePresence } from "motion/react";

export function DashboardContainer() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("today");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Allow deep-linking to a tab (e.g. the header's Settings menu item).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
  }, []);

  const goToDay = (date: Date) => {
    setSelectedDate(date);
    setActiveTab("today");
  };

  if (!session) return null;

  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const isToday = isDateToday(selectedDate);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="mb-8 flex w-full overflow-x-auto md:w-auto md:inline-flex h-11 bg-secondary/60 p-1 gap-0.5">
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
            value="insights"
            className="gap-2 rounded-lg px-4 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-card data-[state=active]:text-foreground transition-all duration-200"
          >
            <BarChart3 />
            Insights
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="gap-2 rounded-lg px-4 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-card data-[state=active]:text-foreground transition-all duration-200"
          >
            <SettingsIcon />
            Settings
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="today" className="space-y-4 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {isToday ? "Today" : format(selectedDate, "EEEE")} ·{" "}
                <span className="font-mono text-muted-foreground text-base">
                  {format(selectedDate, "MMM d, yyyy")}
                </span>
              </h2>
              <div className="flex items-center gap-2">
                {!isToday && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Jump to today
                  </Button>
                )}
                <DatePicker
                  date={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                />
              </div>
            </div>

            {/* Asymmetric layout: tall entry form on the left, goal progress
                + entries list stacked on the right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[auto_1fr] gap-4">
              <Card className="lg:col-span-1 lg:row-span-2 p-4">
                <h3 className="text-base font-semibold mb-4">New Time Entry</h3>
                <TimeEntryForm date={selectedDate} />
              </Card>

              <Card className="lg:col-span-2 p-4">
                <h3 className="text-base font-semibold mb-4">
                  {isToday ? "Today's Entries" : "Entries for this day"}
                </h3>
                <RecentActivity date={dateKey} isToday={isToday} />
              </Card>

              <div className="lg:col-span-2">
                <GoalProgressCard />
              </div>
            </div>
          </TabsContent>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <TabsContent value="calendar" className="animate-fade-in">
            <Card className="p-4">
              <MonthView onSelectDay={goToDay} />
            </Card>
          </TabsContent>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <TabsContent value="insights" className="animate-fade-in">
            <Card className="p-4">
              <Insights />
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
        <AnimatePresence mode="wait">
          <TabsContent value="settings" className="animate-fade-in">
            <Card className="p-4">
              <SettingsForm />
            </Card>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
