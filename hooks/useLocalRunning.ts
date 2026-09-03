"use client";

import { useState, useEffect } from "react";
import type { RunningLog, RunType } from "@/types";

const KEY = "pm_running";

export function useLocalRunning() {
  const [logs, setLogs] = useState<RunningLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem(KEY);
        setLogs(raw ? JSON.parse(raw) : []);
      } catch { setLogs([]); }
      setLoading(false);
    }
    load();
    function onStorage(e: StorageEvent) {
      if (e.key === KEY) load();
    }
    function onVisible() {
      if (document.visibilityState === "visible") load();
    }
    function onFocus() { load(); }
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) load();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow as EventListener);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow as EventListener);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  function addRun(data: { distance_km: number; duration_min: number; avg_heart_rate?: number; run_type: RunType }): RunningLog {
    const log: RunningLog = {
      id: `run_${Date.now()}`,
      user_id: "local",
      created_at: new Date().toISOString(),
      ...data,
    };
    const next = [...logs, log].sort((a, b) => a.created_at.localeCompare(b.created_at));
    setLogs(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    return log;
  }

  function removeRun(id: string) {
    const next = logs.filter((l) => l.id !== id);
    setLogs(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }

  return { logs, loading, addRun, removeRun };
}
