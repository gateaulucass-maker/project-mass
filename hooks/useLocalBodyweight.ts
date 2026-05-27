"use client";

import { useState, useEffect } from "react";
import type { BodyweightLog } from "@/types";
import { MOCK_BODYWEIGHT } from "@/lib/mock-data";

const KEY = "pm_bodyweight";

export function useLocalBodyweight() {
  const [logs, setLogs] = useState<BodyweightLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          setLogs(JSON.parse(raw));
        } else {
          // Initialise avec les données mock au premier usage
          setLogs(MOCK_BODYWEIGHT);
          localStorage.setItem(KEY, JSON.stringify(MOCK_BODYWEIGHT));
        }
      } catch { setLogs(MOCK_BODYWEIGHT); }
      setLoading(false);
    }
    load();
    function onStorage(e: StorageEvent) {
      if (e.key === KEY) load();
    }
    function onVisible() {
      if (document.visibilityState === "visible") load();
    }
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  function addWeight(weight: number): BodyweightLog {
    const log: BodyweightLog = {
      id: `bw_${Date.now()}`,
      user_id: "local",
      weight,
      created_at: new Date().toISOString(),
    };
    const next = [...logs, log].sort((a, b) => a.created_at.localeCompare(b.created_at));
    setLogs(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    return log;
  }

  return { logs, loading, addWeight };
}
