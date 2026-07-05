import * as z from "zod";

// Compares two "HH:mm" strings by their actual minute-of-day value, not
// lexically — lexical comparison happens to work for same-day HH:mm pairs,
// but keeping it explicit avoids subtle breakage (e.g. around "00:00").
function toMinutesOfDay(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export const timeEntrySchema = z
  .object({
    startDateTime: z.string().min(1, "Start time is required"),
    endTime: z.string().optional(),
    projectId: z.string().optional(),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    workspace: z.enum(["OFFICE", "HOME"]),
    date: z.date(),
    excluded: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startDateTime && data.endTime) {
        return toMinutesOfDay(data.endTime) > toMinutesOfDay(data.startDateTime);
      }
      return true;
    },
    {
      // Entries can't span midnight into the next day (yet) — end time must
      // fall later on the same calendar day as start time.
      message: "End time must be after start time, on the same day",
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
        startDateTime: z.string(), // HH:mm format
        endTime: z.string().optional(), // HH:mm format
      }),
    ),
  })
  .refine(
    (data) => {
      return data.entries.every((entry) => {
        if (entry.startDateTime && entry.endTime) {
          const start = entry.startDateTime.split(":").map(Number);
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
