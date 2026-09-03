"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { RunningLog } from "@/types";

interface RunningChartProps {
  data: RunningLog[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const distance = payload.find((p: any) => p.dataKey === "distance")?.value;
  const pace = payload.find((p: any) => p.dataKey === "pace")?.value;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 shadow-lg text-sm space-y-0.5">
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      <p className="font-bold text-brand-700">{distance?.toFixed(1)} km</p>
      {pace != null && (
        <p className="text-xs text-blue-400 font-semibold">
          {Math.floor(pace)}:{String(Math.round((pace - Math.floor(pace)) * 60)).padStart(2, "0")}/km
        </p>
      )}
    </div>
  );
}

export function RunningChart({ data }: RunningChartProps) {
  const chartData = data.map((d) => ({
    date: format(parseISO(d.created_at), "dd MMM", { locale: fr }),
    distance: d.distance_km,
    pace: d.duration_min / d.distance_km,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}km`}
          width={40}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          reversed
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v.toFixed(1)}`}
          width={35}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar yAxisId="left" dataKey="distance" fill="#7c3aed" radius={[4, 4, 0, 0]} fillOpacity={0.7} barSize={16} />
        <Line yAxisId="right" type="monotone" dataKey="pace" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
