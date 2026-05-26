"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MOCK_PERFORMANCE_DATA } from "@/lib/mock-data";

const lines = [
  { key: "bench", label: "Développé couché", color: "#7c3aed" },
  { key: "squat", label: "Squat", color: "#3b82f6" },
  { key: "deadlift", label: "Soulevé de terre", color: "#10b981" },
  { key: "ohp", label: "Développé militaire", color: "#f59e0b" },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 shadow-lg text-xs space-y-1.5">
      <p className="text-muted-foreground font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-foreground/80">{p.name?.split(" ")[0]}</span>
          <span className="font-bold ml-auto">{p.value} kg</span>
        </div>
      ))}
    </div>
  );
}

export function PerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={MOCK_PERFORMANCE_DATA} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}`}
          width={35}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
          formatter={(value) => <span style={{ color: "hsl(var(--muted-foreground))" }}>{value}</span>}
        />
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.label}
            stroke={l.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: "hsl(var(--background))", strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
