"use client";

import { useState, useEffect, useCallback } from "react";
import type { BodyweightLog } from "@/types";

export function useBodyweight() {
  const [logs, setLogs] = useState<BodyweightLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch("/api/bodyweight");
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  async function addWeight(weight: number): Promise<BodyweightLog | null> {
    const res = await fetch("/api/bodyweight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight }),
    });
    if (!res.ok) return null;
    const log = await res.json();
    setLogs(prev => [...prev, log]);
    return log;
  }

  return { logs, loading, addWeight, refresh: fetch_ };
}
