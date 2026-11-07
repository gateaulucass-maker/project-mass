import type { ReactNode } from "react";
import { XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CHART_COLORS } from "./palette";

export const CHART_MARGIN = { top: 5, right: 5, bottom: 0, left: 0 };
export const AXIS_TICK = { fontSize: 10, fill: CHART_COLORS.mutedForeground };

export const formatChartDate = (iso: string) => format(parseISO(iso), "dd MMM", { locale: fr });

/** Helpers (fonctions, pas composants : recharts inspecte ses enfants directs). */
export function dateXAxis(interval?: "preserveStartEnd") {
  return <XAxis dataKey="date" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={interval} />;
}

interface YAxisOpts {
  width: number;
  yAxisId?: string;
  orientation?: "left" | "right";
  reversed?: boolean;
  domain?: [number, number];
  tickFormatter: (v: number) => string;
}
export function valueYAxis(o: YAxisOpts) {
  return <YAxis {...o} tick={AXIS_TICK} tickLine={false} axisLine={false} />;
}

export interface TooltipRow {
  label?: string;
  value: ReactNode;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  rows: TooltipRow[];
  /** "text": lignes de texte colorées ; "legend": pastille + libellé + valeur */
  variant?: "text" | "legend";
}

export function ChartTooltip({ active, label, rows, variant = "text" }: ChartTooltipProps) {
  if (!active || !rows.length) return null;
  if (variant === "legend") {
    return (
      <div className="bg-white border border-border rounded-xl px-3 py-2.5 shadow-lg text-xs space-y-1.5">
        <p className="text-muted-foreground font-medium">{label}</p>
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
            <span className="text-foreground/80">{r.label}</span>
            <span className="font-bold ml-auto">{r.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 shadow-lg text-sm space-y-0.5">
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      {rows.map((r, i) => (
        <p
          key={i}
          className={i === 0 ? "font-bold" : "text-xs font-semibold"}
          style={{ color: r.color }}
        >
          {r.value}
        </p>
      ))}
    </div>
  );
}
