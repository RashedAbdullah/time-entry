"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Wallet, Loader2 } from "lucide-react";

export function SettingsForm() {
  const { settings, isLoading, isSaving, updateSettings } = useSettings();

  const [goalHours, setGoalHours] = useState("");
  const [salary, setSalary] = useState("");

  useEffect(() => {
    if (!isLoading) {
      setGoalHours(settings.monthlyGoalHours?.toString() ?? "");
      setSalary(settings.monthlySalary?.toString() ?? "");
    }
  }, [isLoading, settings.monthlyGoalHours, settings.monthlySalary]);

  const parsedGoal = Number(goalHours);
  const parsedSalary = Number(salary);
  const hasGoal = goalHours.trim() !== "" && parsedGoal > 0;
  const hasSalary = salary.trim() !== "" && parsedSalary >= 0;
  const previewRate = hasGoal && hasSalary ? parsedSalary / parsedGoal : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (goalHours.trim() !== "" && !hasGoal) {
      toast.error("Monthly goal hours must be a positive number");
      return;
    }
    if (salary.trim() !== "" && !hasSalary) {
      toast.error("Monthly salary must be a positive number");
      return;
    }

    try {
      await updateSettings({
        monthlyGoalHours: hasGoal ? parsedGoal : null,
        monthlySalary: hasSalary ? parsedSalary : null,
      });
      toast.success("Settings saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save settings");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-xl">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Monthly goal & salary
          </CardTitle>
          <CardDescription>
            Set how many hours you aim to work each month and what that's
            worth — the Day tab will track your progress and earnings live.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goalHours">Monthly goal (hours)</Label>
            <Input
              id="goalHours"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 160 or 200"
              value={goalHours}
              onChange={(e) => setGoalHours(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary" className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" />
              Salary for that goal
            </Label>
            <Input
              id="salary"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 25000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>

          {previewRate !== null && (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <span className="text-muted-foreground">Effective rate: </span>
              <span className="font-mono font-semibold text-primary">
                {previewRate.toFixed(2)} / hour
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSaving}>
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save settings
      </Button>
    </form>
  );
}
