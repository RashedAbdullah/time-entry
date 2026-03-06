// src/hooks/useTimeEntries.ts
import useSWR from 'swr';
import { useState } from 'react';
import { api } from '@/lib/api/time-entries';

export function useTimeEntries() {
  const [isLoading, setIsLoading] = useState(false);

  const { data: todayEntries, error, mutate } = useSWR(
    '/api/time-entries/today',
    api.getTodayEntries
  );

  const { data: activeEntry } = useSWR(
    '/api/time-entries/active',
    api.getActiveEntry
  );

  const createEntry = async (data: any) => {
    setIsLoading(true);
    try {
      await api.createEntry(data);
      mutate();
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = async (data: any) => {
    setIsLoading(true);
    try {
      await api.startTimer(data);
      mutate();
    } finally {
      setIsLoading(false);
    }
  };

  const stopTimer = async () => {
    setIsLoading(true);
    try {
      await api.stopTimer();
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

  const adjustTime = async (entryId: string, minutes: number, reason: string) => {
    setIsLoading(true);
    try {
      await api.adjustTime(entryId, { minutes, reason });
      mutate();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    todayEntries,
    activeEntry,
    isLoading,
    error,
    createEntry,
    startTimer,
    stopTimer,
    updateEntry,
    deleteEntry,
    adjustTime,
  };
}