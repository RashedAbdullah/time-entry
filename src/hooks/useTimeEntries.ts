import useSWR, { mutate as globalMutate } from "swr";
import { useState } from "react";
import { api } from "@/lib/api/time-entries";
import { todayDateKey } from "@/lib/date-formatters";

// Creating/editing/deleting/adjusting an entry can change the day list, the
// month calendar, and the monthly goal/salary progress at once — all of
// which are cached under different SWR keys. Invalidate everything derived
// from time-entry data so none of it goes stale after a mutation.
function revalidateAllTimeData() {
  globalMutate(
    (key) =>
      typeof key === "string" &&
      (key.startsWith("/api/time-entries") || key.startsWith("/api/reports")),
    undefined,
    { revalidate: true },
  );
}

export function useTimeEntries(date: string = todayDateKey()) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: dayEntriesResponse,
    error,
  } = useSWR(`/api/time-entries?date=${date}`, () => api.getEntriesByDate(date));

  const createEntry = async (data: any) => {
    setIsLoading(true);
    try {
      const result = await api.createEntry(data);
      revalidateAllTimeData();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEntry = async (id: string, data: any) => {
    setIsLoading(true);
    try {
      const result = await api.updateEntry(id, data);
      revalidateAllTimeData();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    setIsLoading(true);
    try {
      await api.deleteEntry(id);
      revalidateAllTimeData();
    } finally {
      setIsLoading(false);
    }
  };

  const adjustTime = async (
    entryId: string,
    minutes: number,
    reason: string,
  ) => {
    setIsLoading(true);
    try {
      await api.adjustTime(entryId, { minutes, reason });
      revalidateAllTimeData();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dayEntries: dayEntriesResponse?.data,
    isLoading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    adjustTime,
  };
}

// All entries within a given "yyyy-MM" month, for the Calendar view — fetched
// with a high limit so it never silently drops entries once a month has more
// than the default page size (this used to cap at 20 entries app-wide).
export function useMonthEntries(monthKey: string) {
  const { data, error } = useSWR(
    `/api/time-entries?month=${monthKey}`,
    () => api.getEntriesByMonth(monthKey),
  );

  return {
    entries: data?.data,
    isLoading: !error && !data,
    error,
  };
}
