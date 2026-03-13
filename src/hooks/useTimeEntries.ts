import useSWR from "swr";
import { useState } from "react";
import { api } from "@/lib/api/time-entries";

export function useTimeEntries() {
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const {
    data: todayEntries,
    error,
    mutate: mutateToday,
  } = useSWR(`/api/time-entries?date=${today}`, api.getTodayEntries);

  const { data: entries, mutate: mutateAll } = useSWR(`/api/time-entries`, api.getEntries);

  const { data: activeEntry, mutate: mutateActive } = useSWR(
    "/api/time-entries/active",
    api.getActiveEntry,
  );

  const mutate = () => {
    mutateToday();
    mutateAll();
    mutateActive();
  };

  const createEntry = async (data: any) => {
    setIsLoading(true);
    try {
      await api.createEntry(data);
      mutate();
    } finally {
      setIsLoading(false);
    }
  };

  const updateEntry = async (id: string, data: any) => {
    setIsLoading(true);
    try {
      await api.updateEntry(id, data);
      mutate();
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    setIsLoading(true);
    try {
      await api.deleteEntry(id);
      mutate();
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
      mutate();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    todayEntries: todayEntries?.data,
    activeEntry,
    isLoading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    adjustTime,
    entries: entries?.data,
  };
}
