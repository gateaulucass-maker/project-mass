"use client";

import { useState, useCallback } from "react";
import type { ActiveSet } from "@/types";

export function useActiveWorkout() {
  const [sets, setSets] = useState<ActiveSet[]>([]);
  const [startTime] = useState(Date.now());

  const toggleSet = useCallback((exerciseId: string, setNumber: number) => {
    setSets(prev => {
      const existing = prev.findIndex(s => s.exercise_id === exerciseId && s.set_number === setNumber);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], completed: !next[existing].completed };
        return next;
      }
      return prev;
    });
  }, []);

  const updateWeight = useCallback((exerciseId: string, setNumber: number, weight: number) => {
    setSets(prev => {
      const next = [...prev];
      const idx = next.findIndex(s => s.exercise_id === exerciseId && s.set_number === setNumber);
      if (idx >= 0) next[idx] = { ...next[idx], weight };
      return next;
    });
  }, []);

  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  const completedCount = sets.filter(s => s.completed).length;

  return { sets, toggleSet, updateWeight, elapsedSeconds, completedCount };
}
