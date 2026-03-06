"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuickProjectModal } from "@/components/projects/QuickProjectModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, FileText, Calendar, Clock, Download } from "lucide-react";

export function QuickActions() {
  const router = useRouter();
  const [showProjectModal, setShowProjectModal] = useState(false);

  const actions = [
    {
      title: "New Time Entry",
      description: "Log your work time",
      icon: Clock,
      onClick: () => router.push("/time-entries/new"),
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Quick Project",
      description: "Create a new project",
      icon: PlusCircle,
      onClick: () => setShowProjectModal(true),
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Monthly Report",
      description: "View this month",
      icon: FileText,
      onClick: () => router.push("/reports/monthly"),
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Export Data",
      description: "PDF or Excel",
      icon: Download,
      onClick: () => router.push("/reports/export"),
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action) => (
              <Button
                key={action.title}
                variant="ghost"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted/50"
                onClick={action.onClick}
              >
                <div className={`p-3 rounded-full ${action.bgColor}`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="font-medium text-sm">{action.title}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {action.description}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <QuickProjectModal
        open={showProjectModal}
        onOpenChange={setShowProjectModal}
      />
    </>
  );
}
