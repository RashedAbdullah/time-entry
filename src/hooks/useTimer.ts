// import { useState, useEffect, useCallback } from "react";
// import { useTimeEntries } from "./useTimeEntries";

// export function useTimer() {
//   const { activeEntry, stopTimer, updateEntry } = useTimeEntries();
//   const [elapsed, setElapsed] = useState<number>(0);
//   const [isRunning, setIsRunning] = useState(false);

//   useEffect(() => {
//     if (activeEntry) {
//       setIsRunning(true);
//       const start = new Date(activeEntry.startTime).getTime();
//       const updateElapsed = () => {
//         setElapsed(Date.now() - start);
//       };

//       updateElapsed();
//       const interval = setInterval(updateElapsed, 1000);

//       return () => clearInterval(interval);
//     } else {
//       setIsRunning(false);
//       setElapsed(0);
//     }
//   }, [activeEntry]);

//   const startTimer = useCallback(async (data: any) => {
//     // This would call your API to start a timer
//     // Implementation depends on your backend
//   }, []);

//   const pauseTimer = useCallback(async () => {
//     if (activeEntry) {
//       await updateEntry(activeEntry.id, {
//         ...activeEntry,
//         endTime: new Date().toISOString(),
//       });
//     }
//   }, [activeEntry, updateEntry]);

//   const resumeTimer = useCallback(async () => {
//     if (activeEntry) {
//       await updateEntry(activeEntry.id, {
//         ...activeEntry,
//         endTime: null,
//       });
//     }
//   }, [activeEntry, updateEntry]);

//   return {
//     elapsed,
//     isRunning,
//     activeEntry,
//     startTimer,
//     pauseTimer,
//     resumeTimer,
//     stopTimer,
//   };
// }
