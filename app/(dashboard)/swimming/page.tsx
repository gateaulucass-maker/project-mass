"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Waves } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { ActivityLogPage } from "@/components/activity/ActivityLogPage";
import type { FormFieldConfig } from "@/components/activity/ActivityForm";
import { filterThisWeek } from "@/components/activity/week";
import { useLocalSwimming } from "@/hooks/useLocalSwimming";
import { formatPacePer100m, getSwimStrokeLabel } from "@/lib/utils";
import type { SwimStroke, PoolLength } from "@/types";

const SwimmingChart = dynamic(() => import("@/components/dashboard/SwimmingChart").then((m) => m.SwimmingChart), {
  ssr: false,
  loading: () => <div className="h-[200px] animate-pulse rounded-lg bg-muted/40" />,
});

const STROKES: { value: SwimStroke; label: string }[] = [
  { value: "crawl", label: "Crawl" },
  { value: "breaststroke", label: "Brasse" },
  { value: "backstroke", label: "Dos" },
  { value: "butterfly", label: "Papillon" },
  { value: "mixed", label: "Mixte" },
];

const FIELDS: FormFieldConfig[] = [
  { kind: "number", name: "laps", label: "Nombre de longueurs", placeholder: "Nb de longueurs", step: "1", autoFocus: true },
  {
    kind: "select",
    name: "poolLength",
    label: "Longueur du bassin",
    keepOnReset: true,
    options: [
      { value: "25", label: "Bassin 25m" },
      { value: "50", label: "Bassin 50m" },
    ],
  },
  { kind: "number", name: "duration", label: "Durée (min)", placeholder: "Durée (min)", step: "1" },
  { kind: "select", name: "stroke", label: "Nage", options: STROKES },
];

export default function SwimmingPage() {
  const { logs, loading, addSwim, removeSwim } = useLocalSwimming();

  // Mémoïsé : ces 4 passes sur logs étaient refaites à chaque frappe dans le formulaire.
  const { totalDistance, totalSwims, lastSwim, weekDistance, avgPaceLabel } = useMemo(() => {
    const total = logs.reduce((s, l) => s + l.distance_m, 0);
    const week = filterThisWeek(logs);
    const totalDuration = logs.reduce((s, l) => s + l.duration_min, 0);
    return {
      totalDistance: total,
      totalSwims: logs.length,
      lastSwim: logs[logs.length - 1],
      weekDistance: week.reduce((s, l) => s + l.distance_m, 0),
      avgPaceLabel: formatPacePer100m(totalDuration, total),
    };
  }, [logs]);

  return (
    <ActivityLogPage
      title="Piscine"
      subtitle="Toutes tes séances de natation"
      icon={Waves}
      accent="sky"
      loading={loading}
      logs={logs}
      hero={{
        label: "Distance totale nagée",
        value: String(totalDistance >= 1000 ? (totalDistance / 1000).toFixed(1) : totalDistance),
        unit: totalDistance >= 1000 ? "km" : "m",
        subline: lastSwim && (
          <p className="text-sm text-muted-foreground mt-2">
            Dernière séance : {format(parseISO(lastSwim.created_at), "dd MMM", { locale: fr })} · {lastSwim.distance_m} m
          </p>
        ),
      }}
      addLabel="Ajouter une séance"
      form={{
        fields: FIELDS,
        onSubmit: (v) => {
          const l = parseInt(v.laps);
          const t = parseFloat(v.duration);
          const pool = Number(v.poolLength) as PoolLength;
          if (!l || l <= 0 || l > 500) { toast.error("Nombre de longueurs invalide"); return false; }
          if (!t || t <= 0 || t > 600) { toast.error("Durée invalide"); return false; }
          addSwim({ laps: l, pool_length: pool, duration_min: t, stroke: v.stroke as SwimStroke });
          toast.success(`${l * pool} m enregistrés ✓`);
          return true;
        },
        footer: (v) =>
          v.laps ? (
            <p className="text-xs text-muted-foreground text-center">
              = {(parseInt(v.laps) || 0) * Number(v.poolLength)} m
            </p>
          ) : null,
      }}
      stats={[
        { label: "Cette semaine", value: `${weekDistance} m`, color: "text-sky-500" },
        { label: "Allure moy.", value: avgPaceLabel, color: "text-brand-700" },
        { label: "Séances", value: `${totalSwims}`, color: "text-muted-foreground" },
      ]}
      chart={{ title: "Distance & allure", element: <SwimmingChart data={logs} /> }}
      history={{
        removeLabel: "Supprimer cette séance",
        onRemove: removeSwim,
        renderRow: (log) => ({
          left: (
            <>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium capitalize">
                  {format(parseISO(log.created_at), "EEEE dd MMM", { locale: fr })}
                </p>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border text-sky-500 bg-sky-500/10 border-sky-500/20">
                  {getSwimStrokeLabel(log.stroke)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatPacePer100m(log.duration_min, log.distance_m)} · {log.duration_min} min · {log.laps}×{log.pool_length}m
              </p>
            </>
          ),
          right: <span className="font-bold">{log.distance_m} m</span>,
        }),
      }}
      emptyMessage="Aucune séance enregistrée. Ajoute ta première séance !"
    />
  );
}
