"use client";

import { memo, useMemo } from "react";
import { ComposedChart, Bar, Line, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts";
import { CHART_COLORS } from "./palette";
import { CHART_MARGIN, ChartTooltip, type TooltipRow, dateXAxis, formatChartDate, valueYAxis } from "./ChartShell";

interface Entry {
  created_at: string;
  duration_min: number;
}

interface Props<T extends Entry> {
  data: T[];
  getDistance: (d: T) => number;
  /** allure en min par unité d'affichage (km ou 100 m) */
  getPace: (d: T) => number;
  distanceUnit: string; // "km" | "m"
  paceUnit: string; // "km" | "100m"
  distanceFormat: (v: number) => string;
  leftAxisWidth: number;
  barColor: string;
  lineColor: string;
}

const formatPace = (p: number) =>
  `${Math.floor(p)}:${String(Math.round((p - Math.floor(p)) * 60)).padStart(2, "0")}`;

function DistancePaceChartInner<T extends Entry>({
  data, getDistance, getPace, distanceUnit, paceUnit, distanceFormat, leftAxisWidth, barColor, lineColor,
}: Props<T>) {
  const chartData = useMemo(
    () => data.map((d) => ({ date: formatChartDate(d.created_at), distance: getDistance(d), pace: getPace(d) })),
    [data, getDistance, getPace]
  );

  const renderTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    const distance = payload?.find((p) => p.dataKey === "distance")?.value;
    const pace = payload?.find((p) => p.dataKey === "pace")?.value;
    const rows: TooltipRow[] = [{ value: `${distanceFormat(distance as number)} ${distanceUnit}`, color: CHART_COLORS.brand700 }];
    if (pace != null) rows.push({ value: `${formatPace(pace)}/${paceUnit}`, color: CHART_COLORS.blue400 });
    return <ChartTooltip active={active && !!payload?.length} label={label} rows={rows} />;
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={chartData} margin={CHART_MARGIN}>
        {dateXAxis("preserveStartEnd")}
        {valueYAxis({ yAxisId: "left", width: leftAxisWidth, tickFormatter: (v) => `${v}${distanceUnit}` })}
        {valueYAxis({ yAxisId: "right", orientation: "right", reversed: true, width: 35, tickFormatter: (v) => v.toFixed(1) })}
        <Tooltip content={renderTooltip} />
        <Bar yAxisId="left" dataKey="distance" fill={barColor} radius={[4, 4, 0, 0]} fillOpacity={0.7} barSize={16} />
        <Line yAxisId="right" type="monotone" dataKey="pace" stroke={lineColor} strokeWidth={2} dot={{ r: 3, fill: lineColor }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export const DistancePaceChart = memo(DistancePaceChartInner) as typeof DistancePaceChartInner;
