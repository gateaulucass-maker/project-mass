"use client";

import { useState, useEffect, useCallback } from "react";
import { addWeeks, getISOWeek, getISOWeekYear } from "date-fns";

export function getWeekStorageKey(weekOffset: number): string {
  const d = addWeeks(new Date(), weekOffset);
  return `pm_checks_${getISOWeekYear(d)}_w${String(getISOWeek(d)).padStart(2, "0")}`;
}

export function useWorkoutChecks(weekOffset: number) {
  const storageKey = getWeekStorageKey(weekOffset);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    function read() {
      try {
        const raw = localStorage.getItem(storageKey);
        setChecked(new Set(raw ? (JSON.parse(raw) as string[]) : []));
      } catch {
        setChecked(new Set());
      }
    }
    read();
    function onStorage(e: StorageEvent) {
      if (e.key === storageKey) read();
    }
    function onVisible() {
      if (document.visibilityState === "visible") read();
    }
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [storageKey]);

  const toggle = useCallback((id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch {}
      return next;
    });
  }, [storageKey]);

  return { checked, toggle };
}
