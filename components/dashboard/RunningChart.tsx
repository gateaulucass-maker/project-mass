"use client";

import { memo } from "react";
import type { RunningLog } from "@/types";
import { DistancePaceChart } from "./charts/DistancePaceChart";
import { CHART_COLORS } from "./charts/palette";

interface RunningChartProps {
  data: RunningLog[];
}

const getDistance = (d: RunningLog) => d.distance_km;
const getPace = (d: RunningLog) => d.duration_min / d.distance_km;
const formatKm = (v: number) => v?.toFixed(1);

export const RunningChart = memo(function RunningChart({ data }: RunningChartProps) {
  return (
    <DistancePaceChart
      data={data}
      getDistance={getDistance}
      getPace={getPace}
      distanceUnit="km"
      paceUnit="km"
      distanceFormat={formatKm}
      leftAxisWidth={40}
      barColor={CHART_COLORS.violet}
      lineColor={CHART_COLORS.blue}
    />
  );
});
