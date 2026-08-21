"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { addWeeks, getISOWeek } from "date-fns";
import { getWeekStorageKey } from "@/hooks/useWorkoutChecks";

interface WeekStat {
  week: string;
  sessions: number;
}

function workoutIdFrom(checkKey: string): string {
  return checkKey.split("_e")[0];
}

function buildStats(): WeekStat[] {
  const stats: WeekStat[] = [];
  for (let offset = -7; offset <= 0; offset++) {
    const d = addWeeks(new Date(), offset);
    const key = getWeekStorageKey(offset);
    let sessions = 0;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const checks: string[] = JSON.parse(raw);
        sessions = new Set(checks.map(workoutIdFrom)).size;
      }
    } catch {}
    stats.push({ week: `S${getISOWeek(d)}`, sessions });
  }
  return stats;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const count = payload[0]?.value ?? 0;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 shadow-lg text-xs">
      <p className="text-muted-foreground font-medium mb-1">{label}</p>
      <p className="font-bold text-brand-700">{count} séance{count !== 1 ? "s" : ""}</p>
    </div>
  );
}

export function VolumeChart() {
  const [data, setData] = useState<WeekStat[]>([]);

  useEffect(() => {
    function refresh() {
      setData(buildStats());
    }
    refresh();

    function onStorage(e: StorageEvent) {
      if (e.key?.startsWith("pm_checks_")) refresh();
    }
    function onUpdated() { refresh(); }
    function onVisible() {
      if (document.visibilityState === "visible") refresh();
    }
    function onFocus() { refresh(); }
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) refresh();
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
  }, []);

  const maxSessions = data.length ? Math.max(...data.map(s => s.sessions)) : 0;

  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barGap={4}>
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)", radius: 8 }} />
        <Bar dataKey="sessions" radius={[6, 6, 0, 0]} minPointSize={4}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={
                entry.sessions === 0
                  ? "rgba(185,28,28,0.12)"
                  : maxSessions > 0 && entry.sessions === maxSessions
                  ? "#B91C1C"
                  : "rgba(185,28,28,0.35)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
