// src/components/time-entry/TimeAdjustmentModal.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  timeAdjustmentSchema,
  type TimeAdjustmentData,
} from "@/lib/validations/time-entry.schema";
import { Clock, AlertCircle, MinusCircle, PlusCircle } from "lucide-react";

interface TimeAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  currentDuration?: number; // in milliseconds
}

export function TimeAdjustmentModal({
  open,
  onOpenChange,
  entryId,
  currentDuration,
}: TimeAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">(
    "subtract",
  );
  const { adjustTime, isLoading } = useTimeEntries();

  const form = useForm<TimeAdjustmentData>({
    resolver: zodResolver(timeAdjustmentSchema),
    defaultValues: {
      minutes: 0,
      reason: "",
    },
  });

  const onSubmit = async (data: TimeAdjustmentData) => {
    // Convert to negative if subtracting
    const minutes =
      adjustmentType === "subtract"
        ? -Math.abs(data.minutes)
        : Math.abs(data.minutes);

    await adjustTime(entryId, minutes, data.reason || "");
    onOpenChange(false);
    form.reset();
  };

  const handleTypeChange = (type: "add" | "subtract") => {
    setAdjustmentType(type);
    const currentValue = form.getValues("minutes");
    if (currentValue) {
      form.setValue("minutes", Math.abs(currentValue));
    }
  };

  const currentMinutes = currentDuration
    ? Math.floor(currentDuration / (1000 * 60))
    : 0;
  const adjustedMinutes = form.watch("minutes");
  const finalMinutes =
    adjustmentType === "subtract"
      ? currentMinutes - Math.abs(adjustedMinutes || 0)
      : currentMinutes + Math.abs(adjustedMinutes || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Adjust Time Entry
          </DialogTitle>
          <DialogDescription>
            Add or subtract time from this entry. This will create an adjustment
            record.
          </DialogDescription>
        </DialogHeader>

        {currentDuration && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex justify-between items-center">
              <span>Current duration:</span>
              <span className="font-mono font-medium">
                {Math.floor(currentMinutes / 60)}h {currentMinutes % 60}m
              </span>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Adjustment Type Selection */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={adjustmentType === "subtract" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleTypeChange("subtract")}
              >
                <MinusCircle className="h-4 w-4 mr-2" />
                Subtract
              </Button>
              <Button
                type="button"
                variant={adjustmentType === "add" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleTypeChange("add")}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Minutes Input */}
            <FormField
              control={form.control}
              name="minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minutes to {adjustmentType}</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="480"
                        step="5"
                        placeholder="30"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quick Select Options */}
            <div className="flex flex-wrap gap-2">
              {[15, 30, 45, 60, 90, 120].map((minutes) => (
                <Button
                  key={minutes}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setValue("minutes", minutes)}
                >
                  {minutes}m
                </Button>
              ))}
            </div>

            {/* Reason Input */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why are you adjusting this entry?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            {adjustedMinutes > 0 && (
              <Alert className="bg-muted">
                <AlertDescription className="space-y-1">
                  <div className="text-sm font-medium">
                    New duration will be:
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Current:</span>
                    <span className="font-mono">
                      {Math.floor(currentMinutes / 60)}h {currentMinutes % 60}m
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-primary">
                    <span>
                      {adjustmentType === "subtract" ? "Subtract:" : "Add:"}
                    </span>
                    <span className="font-mono font-medium">
                      {adjustedMinutes}m
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-1 mt-1">
                    <span className="font-medium">Final:</span>
                    <span className="font-mono font-bold text-primary">
                      {Math.floor(finalMinutes / 60)}h {finalMinutes % 60}m
                    </span>
                  </div>
                  {finalMinutes < 0 && (
                    <div className="text-xs text-destructive mt-1">
                      Warning: This will result in negative duration
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.watch("minutes")}
              >
                {isLoading ? "Adjusting..." : "Apply Adjustment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
