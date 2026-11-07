"use client";

import { memo, useMemo } from "react";
import { AreaChart, Area, Tooltip, ResponsiveContainer, ReferenceLine, type TooltipProps } from "recharts";
import type { BodyweightLog } from "@/types";
import { CHART_MARGIN, ChartTooltip, dateXAxis, formatChartDate, valueYAxis } from "./charts/ChartShell";
import { CHART_COLORS } from "./charts/palette";

interface WeightChartProps {
  data: BodyweightLog[];
  targetWeight?: number;
}

function WeightTooltip({ active, payload, label }: TooltipProps<number, string>) {
  const value = payload?.[0]?.value;
  return (
    <ChartTooltip
      active={active && !!payload?.length}
      label={label}
      rows={[{ value: `${value?.toFixed(1)} kg`, color: CHART_COLORS.brand700 }]}
    />
  );
}

export const WeightChart = memo(function WeightChart({ data, targetWeight }: WeightChartProps) {
  const chartData = useMemo(
    () => data.map((d) => ({ date: formatChartDate(d.created_at), weight: d.weight })),
    [data]
  );
  const domain = useMemo<[number, number] | undefined>(() => {
    if (!data.length) return undefined;
    const w = data.map((d) => d.weight);
    return [Math.min(...w) - 0.5, Math.max(...w) + 0.5];
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={CHART_MARGIN}>
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.violet} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.violet} stopOpacity={0} />
          </linearGradient>
        </defs>
        {dateXAxis("preserveStartEnd")}
        {valueYAxis({ domain, width: 45, tickFormatter: (v) => `${v}kg` })}
        <Tooltip content={<WeightTooltip />} />
        {targetWeight && (
          <ReferenceLine
            y={targetWeight}
            stroke={CHART_COLORS.violet}
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            label={{ value: `Objectif ${targetWeight}kg`, position: "insideTopRight", fontSize: 10, fill: CHART_COLORS.violet }}
          />
        )}
        <Area
          type="monotone"
          dataKey="weight"
          stroke={CHART_COLORS.violet}
          strokeWidth={2}
          fill="url(#weightGradient)"
          dot={false}
          activeDot={{ r: 4, fill: CHART_COLORS.violet, stroke: CHART_COLORS.background, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});
