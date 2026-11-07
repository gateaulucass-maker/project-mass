"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Footprints, Heart } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { ActivityLogPage } from "@/components/activity/ActivityLogPage";
import type { FormFieldConfig } from "@/components/activity/ActivityForm";
import { filterThisWeek } from "@/components/activity/week";
import { useLocalRunning } from "@/hooks/useLocalRunning";
import { formatPacePerKm, getRunTypeLabel, getRunTypeColor } from "@/lib/utils";
import type { RunType } from "@/types";

const RunningChart = dynamic(() => import("@/components/dashboard/RunningChart").then((m) => m.RunningChart), {
  ssr: false,
  loading: () => <div className="h-[200px] animate-pulse rounded-lg bg-muted/40" />,
});

const RUN_TYPES: { value: RunType; label: string }[] = [
  { value: "easy", label: "Footing" },
  { value: "interval", label: "Fractionné" },
  { value: "race", label: "Course" },
  { value: "trail", label: "Trail" },
];

const FIELDS: FormFieldConfig[] = [
  { kind: "number", name: "distance", label: "Distance (km)", placeholder: "Distance (km)", step: "0.1", autoFocus: true },
  { kind: "number", name: "duration", label: "Durée (min)", placeholder: "Durée (min)", step: "1" },
  { kind: "number", name: "heartRate", label: "Fréquence cardiaque moyenne (bpm, optionnel)", placeholder: "FC moy. (bpm, optionnel)", step: "1" },
  { kind: "select", name: "runType", label: "Type de sortie", options: RUN_TYPES },
];

export default function RunningPage() {
  const { logs, loading, addRun, removeRun } = useLocalRunning();

  // Mémoïsé : ces 4 passes sur logs étaient refaites à chaque frappe dans le formulaire.
  const { totalDistance, totalRuns, lastRun, weekDistance, avgPaceLabel } = useMemo(() => {
    const total = logs.reduce((s, l) => s + l.distance_km, 0);
    const week = filterThisWeek(logs);
    const totalDuration = logs.reduce((s, l) => s + l.duration_min, 0);
    return {
      totalDistance: total,
      totalRuns: logs.length,
      lastRun: logs[logs.length - 1],
      weekDistance: week.reduce((s, l) => s + l.distance_km, 0),
      avgPaceLabel: formatPacePerKm(totalDuration, total),
    };
  }, [logs]);

  return (
    <ActivityLogPage
      title="Course à pied"
      subtitle="Toutes tes sorties running"
      icon={Footprints}
      accent="brand"
      loading={loading}
      logs={logs}
      hero={{
        label: "Distance totale",
        value: totalDistance.toFixed(1),
        unit: "km",
        subline: lastRun && (
          <p className="text-sm text-muted-foreground mt-2">
            Dernière sortie : {format(parseISO(lastRun.created_at), "dd MMM", { locale: fr })} · {lastRun.distance_km} km
          </p>
        ),
      }}
      addLabel="Ajouter une sortie"
      form={{
        fields: FIELDS,
        onSubmit: (v) => {
          const d = parseFloat(v.distance);
          const t = parseFloat(v.duration);
          if (!d || d <= 0 || d > 300) { toast.error("Distance invalide"); return false; }
          if (!t || t <= 0 || t > 1440) { toast.error("Durée invalide"); return false; }
          addRun({
            distance_km: d,
            duration_min: t,
            avg_heart_rate: v.heartRate ? parseInt(v.heartRate) : undefined,
            run_type: v.runType as RunType,
          });
          toast.success(`${d} km enregistrés ✓`);
          return true;
        },
      }}
      stats={[
        { label: "Cette semaine", value: `${weekDistance.toFixed(1)} km`, color: "text-brand-700" },
        { label: "Allure moy.", value: avgPaceLabel, color: "text-blue-400" },
        { label: "Sorties", value: `${totalRuns}`, color: "text-muted-foreground" },
      ]}
      chart={{ title: "Distance & allure", element: <RunningChart data={logs} /> }}
      history={{
        removeLabel: "Supprimer cette sortie",
        onRemove: removeRun,
        renderRow: (log) => ({
          left: (
            <>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium capitalize">
                  {format(parseISO(log.created_at), "EEEE dd MMM", { locale: fr })}
                </p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${getRunTypeColor(log.run_type)}`}>
                  {getRunTypeLabel(log.run_type)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                {formatPacePerKm(log.duration_min, log.distance_km)} · {log.duration_min} min
                {log.avg_heart_rate && (
                  <span className="flex items-center gap-0.5">
                    <Heart className="w-3 h-3 text-red-400" /> {log.avg_heart_rate}
                  </span>
                )}
              </p>
            </>
          ),
          right: <span className="font-bold">{log.distance_km} km</span>,
        }),
      }}
      emptyMessage="Aucune sortie enregistrée. Ajoute ta première course !"
    />
  );
}
