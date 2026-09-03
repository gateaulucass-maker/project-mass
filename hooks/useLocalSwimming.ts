"use client";

import { useState, useEffect } from "react";
import type { SwimmingLog, SwimStroke, PoolLength } from "@/types";

const KEY = "pm_swimming";

export function useLocalSwimming() {
  const [logs, setLogs] = useState<SwimmingLog[]>([]);
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

  function addSwim(data: { laps: number; pool_length: PoolLength; duration_min: number; stroke: SwimStroke }): SwimmingLog {
    const log: SwimmingLog = {
      id: `swim_${Date.now()}`,
      user_id: "local",
      created_at: new Date().toISOString(),
      distance_m: data.laps * data.pool_length,
      ...data,
    };
    const next = [...logs, log].sort((a, b) => a.created_at.localeCompare(b.created_at));
    setLogs(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    return log;
  }

  function removeSwim(id: string) {
    const next = logs.filter((l) => l.id !== id);
    setLogs(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }

  return { logs, loading, addSwim, removeSwim };
}
