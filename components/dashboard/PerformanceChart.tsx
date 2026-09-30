"use client";

import { memo } from "react";
import { LineChart, Line, Tooltip, ResponsiveContainer, Legend, type TooltipProps } from "recharts";
import { MOCK_PERFORMANCE_DATA } from "@/lib/mock-data";
import { CHART_MARGIN, ChartTooltip, dateXAxis, valueYAxis } from "./charts/ChartShell";
import { CHART_COLORS } from "./charts/palette";

const lines = [
  { key: "squat",     label: "Squat",          color: CHART_COLORS.brand700 },
  { key: "bench",     label: "Dév. couché",    color: CHART_COLORS.purple },
  { key: "tractions", label: "Tractions",      color: CHART_COLORS.blueStrong },
  { key: "rowing",    label: "Rowing barre",   color: CHART_COLORS.emerald },
  { key: "militaire", label: "Dev. militaire", color: CHART_COLORS.amber },
];

function PerformanceTooltip({ active, payload, label }: TooltipProps<number, string>) {
  const rows = (payload ?? []).map((p) => ({ label: p.name, value: `${p.value} kg`, color: p.color }));
  return <ChartTooltip variant="legend" active={active} label={label} rows={rows} />;
}

export const PerformanceChart = memo(function PerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={MOCK_PERFORMANCE_DATA} margin={CHART_MARGIN}>
        {dateXAxis()}
        {valueYAxis({ width: 35, tickFormatter: (v) => `${v}` })}
        <Tooltip content={<PerformanceTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
          formatter={(value) => <span style={{ color: CHART_COLORS.mutedForeground }}>{value}</span>}
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
            activeDot={{ r: 4, stroke: CHART_COLORS.white, strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
});
