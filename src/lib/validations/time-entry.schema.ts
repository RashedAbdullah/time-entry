import * as z from "zod";

export const timeEntrySchema = z
  .object({
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().optional(),
    projectId: z.string().optional(),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    workspace: z.enum(["OFFICE", "HOME"], {
      required_error: "Please select a workspace",
    }),
    date: z.date({
      required_error: "Date is required",
    }),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export type TimeEntryFormData = z.infer<typeof timeEntrySchema>;

export const timeAdjustmentSchema = z.object({
  minutes: z
    .number()
    .min(-480, "Adjustment cannot be less than -8 hours")
    .max(480, "Adjustment cannot be more than 8 hours"),
  reason: z
    .string()
    .max(200, "Reason must be less than 200 characters")
    .optional(),
});

export type TimeAdjustmentData = z.infer<typeof timeAdjustmentSchema>;

export const timeEntryFilterSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  projectId: z.string().optional(),
  workspace: z.enum(["OFFICE", "HOME", "ALL"]).optional(),
  search: z.string().optional(),
});

export type TimeEntryFilterData = z.infer<typeof timeEntryFilterSchema>;

export const bulkTimeEntrySchema = z
  .object({
    entries: z.array(
      z.object({
        date: z.date(),
        projectId: z.string().optional(),
        description: z.string().max(500).optional(),
        workspace: z.enum(["OFFICE", "HOME"]),
        startTime: z.string(), // HH:mm format
        endTime: z.string().optional(), // HH:mm format
      }),
    ),
  })
  .refine(
    (data) => {
      return data.entries.every((entry) => {
        if (entry.startTime && entry.endTime) {
          const start = entry.startTime.split(":").map(Number);
          const end = entry.endTime.split(":").map(Number);
          const startMinutes = start[0] * 60 + start[1];
          const endMinutes = end[0] * 60 + end[1];
          return endMinutes > startMinutes;
        }
        return true;
      });
    },
    {
      message: "End time must be after start time for all entries",
      path: ["entries"],
    },
  );

export type BulkTimeEntryData = z.infer<typeof bulkTimeEntrySchema>;

// Validation helpers
export function validateTimeEntry(data: unknown): TimeEntryFormData {
  return timeEntrySchema.parse(data);
}

export function validateTimeAdjustment(data: unknown): TimeAdjustmentData {
  return timeAdjustmentSchema.parse(data);
}

export function validateTimeEntryFilter(data: unknown): TimeEntryFilterData {
  return timeEntryFilterSchema.parse(data);
}

export function validateBulkTimeEntry(data: unknown): BulkTimeEntryData {
  return bulkTimeEntrySchema.parse(data);
}

// Partial validation for forms
// export const partialTimeEntrySchema = timeEntrySchema?.partial();
// export type PartialTimeEntryData = z.infer<typeof partialTimeEntrySchema>;
