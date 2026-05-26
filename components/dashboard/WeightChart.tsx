"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { BodyweightLog } from "@/types";

interface WeightChartProps {
  data: BodyweightLog[];
  targetWeight?: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 shadow-lg text-sm">
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      <p className="font-bold text-brand-700">{payload[0]?.value?.toFixed(1)} kg</p>
    </div>
  );
}

export function WeightChart({ data, targetWeight }: WeightChartProps) {
  const chartData = data.map((d) => ({
    date: format(parseISO(d.created_at), "dd MMM", { locale: fr }),
    weight: d.weight,
  }));

  const minWeight = Math.min(...data.map(d => d.weight)) - 0.5;
  const maxWeight = Math.max(...data.map(d => d.weight)) + 0.5;

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minWeight, maxWeight]}
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}kg`}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        {targetWeight && (
          <ReferenceLine
            y={targetWeight}
            stroke="#7c3aed"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            label={{ value: `Objectif ${targetWeight}kg`, position: "insideTopRight", fontSize: 10, fill: "#7c3aed" }}
          />
        )}
        <Area
          type="monotone"
          dataKey="weight"
          stroke="#7c3aed"
          strokeWidth={2}
          fill="url(#weightGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "#7c3aed", stroke: "hsl(var(--background))", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
