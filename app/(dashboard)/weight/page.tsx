"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Scale, TrendingUp, TrendingDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { ActivityLogPage } from "@/components/activity/ActivityLogPage";
import type { FormFieldConfig } from "@/components/activity/ActivityForm";
import { filterThisWeek } from "@/components/activity/week";
import { useLocalBodyweight } from "@/hooks/useLocalBodyweight";
import { useLocalPrograms } from "@/hooks/useLocalPrograms";
import { calculateWeightProgress } from "@/lib/utils";

const WeightChart = dynamic(() => import("@/components/dashboard/WeightChart").then((m) => m.WeightChart), {
  ssr: false,
  loading: () => <div className="h-[180px] animate-pulse rounded-lg bg-muted/40" />,
});

const FIELDS: FormFieldConfig[] = [
  { kind: "number", name: "weight", label: "Poids (kg)", placeholder: "Ex: 81.5", step: "0.1", autoFocus: true },
];

export default function WeightPage() {
  const { logs, loading, addWeight } = useLocalBodyweight();
  const { activeProgram } = useLocalPrograms();

  const latest = logs[logs.length - 1];
  const firstLog = logs[0];
  const totalChange = latest && firstLog ? latest.weight - firstLog.weight : 0;
  // calculateWeightProgress borne et gère start === target (sinon 0/0 = NaN%).
  const goalProgress =
    latest && activeProgram?.start_weight != null && activeProgram?.target_weight != null
      ? calculateWeightProgress(latest.weight, activeProgram.start_weight, activeProgram.target_weight)
      : 0;

  const weekAvg = useMemo(() => {
    const thisWeek = filterThisWeek(logs);
    return thisWeek.length > 0
      ? thisWeek.reduce((s, l) => s + l.weight, 0) / thisWeek.length
      : logs[logs.length - 1]?.weight ?? 0;
  }, [logs]);

  return (
    <ActivityLogPage
      title="Suivi poids"
      subtitle="Ton évolution corporelle"
      icon={Scale}
      accent="brand"
      loading={loading}
      logs={logs}
      hero={{
        label: "Poids actuel",
        value: latest?.weight.toFixed(1) ?? "—",
        unit: "kg",
        subline: latest && firstLog && (
          <div className="flex items-center gap-1.5 mt-2">
            {totalChange > 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
            <span className={`text-sm font-semibold ${totalChange > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {totalChange > 0 ? "+" : ""}{totalChange.toFixed(1)} kg depuis le début
            </span>
          </div>
        ),
      }}
      addLabel="Ajouter une pesée"
      form={{
        fields: FIELDS,
        layout: "inline",
        onSubmit: (v) => {
          const w = parseFloat(v.weight);
          if (!w || w < 30 || w > 300) { toast.error("Poids invalide"); return false; }
          addWeight(w);
          toast.success(`${w} kg enregistré ✓`);
          return true;
        },
      }}
      stats={[
        { label: "Objectif", value: activeProgram?.target_weight ? `${activeProgram.target_weight} kg` : "—", color: "text-brand-700" },
        { label: "Moy. semaine", value: `${weekAvg.toFixed(1)} kg`, color: "text-blue-400" },
        { label: "Départ", value: firstLog ? `${firstLog.weight} kg` : "—", color: "text-muted-foreground" },
      ]}
      chart={{ title: "Évolution du poids", element: <WeightChart data={logs} targetWeight={activeProgram?.target_weight} /> }}
      extra={
        activeProgram?.target_weight && activeProgram?.start_weight && latest && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progression vers l&apos;objectif</span>
              <span className="font-semibold text-brand-700">{Math.round(goalProgress)}%</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full gradient-brand rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
              <span>{activeProgram.start_weight} kg</span>
              <span>{activeProgram.target_weight} kg</span>
            </div>
          </div>
        )
      }
      history={{
        limit: 15,
        renderRow: (log) => {
          const idx = logs.indexOf(log);
          const prev = idx > 0 ? logs[idx - 1] : null;
          const diff = prev ? log.weight - prev.weight : 0;
          return {
            left: (
              <>
                <p className="text-sm font-medium capitalize">
                  {format(parseISO(log.created_at), "EEEE dd MMM", { locale: fr })}
                </p>
                <p className="text-xs text-muted-foreground">{format(parseISO(log.created_at), "HH:mm")}</p>
              </>
            ),
            right: (
              <>
                {diff !== 0 && (
                  <span className={`text-xs font-medium ${diff > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                  </span>
                )}
                <span className="font-bold">{log.weight.toFixed(1)} kg</span>
              </>
            ),
          };
        },
      }}
    />
  );
}
