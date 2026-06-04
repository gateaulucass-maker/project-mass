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
    // Événement custom pour les mises à jour dans le même onglet
    function onUpdated(e: Event) {
      const key = (e as CustomEvent<string>).detail;
      if (!key || key === storageKey) read();
    }
    function onVisible() {
      if (document.visibilityState === "visible") read();
    }
    function onFocus() { read(); }
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) read(); // bfcache mobile (iOS Safari)
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("pm-updated", onUpdated);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow as EventListener);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pm-updated", onUpdated);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow as EventListener);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [storageKey]);

  const toggle = useCallback((id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
        // Notifie tous les composants du même onglet
        window.dispatchEvent(new CustomEvent("pm-updated", { detail: storageKey }));
      } catch {}
      return next;
    });
  }, [storageKey]);

  return { checked, toggle };
}
