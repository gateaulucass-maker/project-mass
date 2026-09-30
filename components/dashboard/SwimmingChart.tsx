"use client";

import { memo } from "react";
import type { SwimmingLog } from "@/types";
import { DistancePaceChart } from "./charts/DistancePaceChart";
import { CHART_COLORS } from "./charts/palette";

interface SwimmingChartProps {
  data: SwimmingLog[];
}

const getDistance = (d: SwimmingLog) => d.distance_m;
const getPace = (d: SwimmingLog) => d.duration_min / (d.distance_m / 100);
const formatM = (v: number) => String(v);

export const SwimmingChart = memo(function SwimmingChart({ data }: SwimmingChartProps) {
  return (
    <DistancePaceChart
      data={data}
      getDistance={getDistance}
      getPace={getPace}
      distanceUnit="m"
      paceUnit="100m"
      distanceFormat={formatM}
      leftAxisWidth={45}
      barColor={CHART_COLORS.sky}
      lineColor={CHART_COLORS.violet}
    />
  );
});
