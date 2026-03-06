// src/components/time-entry/ActiveTimer.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { formatDuration } from '@/lib/utils/time.utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Square } from 'lucide-react';

export function ActiveTimer() {
  const { activeEntry, stopTimer } = useTimeEntries();
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (!activeEntry) return;

    const interval = setInterval(() => {
      const start = new Date(activeEntry.startTime).getTime();
      const now = Date.now();
      setElapsed(now - start);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEntry]);

  if (!activeEntry) return null;

  return (
    <Card className="fixed bottom-4 right-4 p-4 bg-primary text-primary-foreground shadow-lg animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 animate-pulse" />
          <span className="font-mono text-lg">{formatDuration(elapsed)}</span>
        </div>
        <div className="text-sm max-w-[200px] truncate">
          {activeEntry.description || 'No description'}
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={stopTimer}
          className="h-8"
        >
          <Square className="h-4 w-4 mr-1" />
          Stop
        </Button>
      </div>
    </Card>
  );
}