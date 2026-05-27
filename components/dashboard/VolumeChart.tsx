"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MOCK_WEEKLY_STATS } from "@/lib/mock-data";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 shadow-lg text-xs">
      <p className="text-muted-foreground font-medium mb-1">{label}</p>
      <p className="font-bold text-brand-700">{payload[0]?.value} séances</p>
      <p className="text-muted-foreground">{(payload[1]?.value / 1000).toFixed(1)}t volume</p>
    </div>
  );
}

export function VolumeChart() {
  const maxSessions = Math.max(...MOCK_WEEKLY_STATS.map(s => s.sessions));

  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={MOCK_WEEKLY_STATS} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barGap={4}>
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)", radius: 8 }} />
        <Bar dataKey="sessions" radius={[6, 6, 0, 0]}>
          {MOCK_WEEKLY_STATS.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.sessions === maxSessions ? "#B91C1C" : "rgba(185,28,28,0.25)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
