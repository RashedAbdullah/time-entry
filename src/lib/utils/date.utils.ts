import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  addDays,
  subDays,
  differenceInDays,
  parseISO,
} from "date-fns";

export const DateUtils = {
  // Format helpers
  formatDate: (date: Date | string, formatStr: string = "PPP") => {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, formatStr);
  },

  formatTime: (date: Date | string, formatStr: string = "HH:mm") => {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, formatStr);
  },

  formatDateTime: (date: Date | string) => {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "PPp");
  },

  // Range helpers
  getWeekRange: (date: Date = new Date()) => ({
    start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(date, { weekStartsOn: 1 }),
  }),

  getMonthRange: (date: Date = new Date()) => ({
    start: startOfMonth(date),
    end: endOfMonth(date),
  }),

  getDaysInRange: (start: Date, end: Date) => eachDayOfInterval({ start, end }),

  // Comparison helpers
  isToday: (date: Date) => isSameDay(date, new Date()),

  isInRange: (date: Date, start: Date, end: Date) =>
    isWithinInterval(date, { start, end }),

  // Navigation helpers
  addDays: (date: Date, amount: number) => addDays(date, amount),
  subDays: (date: Date, amount: number) => subDays(date, amount),

  // Difference helpers
  daysBetween: (start: Date, end: Date) => differenceInDays(end, start),

  // Week number
  getWeekNumber: (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  },

  // Month name
  getMonthName: (date: Date, monthFormat: "long" | "short" = "long") =>
    format(date, monthFormat === "long" ? "MMMM" : "MMM"),

  // Year
  getYear: (date: Date) => date.getFullYear(),

  // Quarter
  getQuarter: (date: Date) => Math.floor(date.getMonth() / 3) + 1,

  // Fiscal year (assuming April start)
  getFiscalYear: (date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    return month >= 3 ? year + 1 : year; // April is month 3 (0-indexed)
  },
};
