"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Footprints, Plus, Trash2, Heart } from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { RunningChart } from "@/components/dashboard/RunningChart";
import { SkeletonCard } from "@/components/shared/LoadingSpinner";
import { useLocalRunning } from "@/hooks/useLocalRunning";
import { formatPacePerKm, getRunTypeLabel, getRunTypeColor } from "@/lib/utils";
import type { RunType } from "@/types";

const RUN_TYPES: { value: RunType; label: string }[] = [
  { value: "easy", label: "Footing" },
  { value: "interval", label: "Fractionné" },
  { value: "race", label: "Course" },
  { value: "trail", label: "Trail" },
];

export default function RunningPage() {
  const { logs, loading, addRun, removeRun } = useLocalRunning();
  const [adding, setAdding] = useState(false);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [runType, setRunType] = useState<RunType>("easy");

  const totalDistance = logs.reduce((s, l) => s + l.distance_km, 0);
  const totalRuns = logs.length;
  const lastRun = logs[logs.length - 1];

  const thisWeek = logs.filter((l) => {
    const now = new Date();
    return isWithinInterval(parseISO(l.created_at), {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    });
  });
  const weekDistance = thisWeek.reduce((s, l) => s + l.distance_km, 0);

  const avgPaceMin = totalDistance > 0
    ? logs.reduce((s, l) => s + l.duration_min, 0) / totalDistance
    : 0;
  const avgPaceLabel = totalDistance > 0
    ? `${Math.floor(avgPaceMin)}:${String(Math.round((avgPaceMin - Math.floor(avgPaceMin)) * 60)).padStart(2, "0")}/km`
    : "—";

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const d = parseFloat(distance);
    const t = parseFloat(duration);
    if (!d || d <= 0 || d > 300) { toast.error("Distance invalide"); return; }
    if (!t || t <= 0 || t > 1440) { toast.error("Durée invalide"); return; }
    addRun({
      distance_km: d,
      duration_min: t,
      avg_heart_rate: heartRate ? parseInt(heartRate) : undefined,
      run_type: runType,
    });
    setDistance("");
    setDuration("");
    setHeartRate("");
    setRunType("easy");
    setAdding(false);
    toast.success(`${d} km enregistrés ✓`);
  }

  if (loading) return (
    <div className="flex-1 px-4 lg:px-6 py-5 space-y-4">
      <SkeletonCard className="h-32" />
      <SkeletonCard className="h-64" />
    </div>
  );

  return (
    <div className="flex-1">
      <Header title="Course à pied" subtitle="Toutes tes sorties running" />

      <div className="px-4 lg:px-6 py-5 max-w-3xl space-y-5">
        <PageHeader title="Course à pied" icon={Footprints} />

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-700/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-end justify-between relative z-10">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Distance totale</p>
              <p className="text-5xl font-black">
                {totalDistance.toFixed(1)}
                <span className="text-2xl font-bold text-muted-foreground ml-1">km</span>
              </p>
              {lastRun && (
                <p className="text-sm text-muted-foreground mt-2">
                  Dernière sortie : {format(parseISO(lastRun.created_at), "dd MMM", { locale: fr })} · {lastRun.distance_km} km
                </p>
              )}
            </div>
            <button
              onClick={() => setAdding(!adding)}
              className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center glow-brand-sm hover:opacity-90 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          {adding && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleAdd}
              className="mt-4 pt-4 border-t border-border space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="Distance (km)"
                  autoFocus
                  className="px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/50 transition-all"
                />
                <input
                  type="number"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Durée (min)"
                  className="px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="1"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  placeholder="FC moy. (bpm, optionnel)"
                  className="px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/50 transition-all"
                />
                <select
                  value={runType}
                  onChange={(e) => setRunType(e.target.value as RunType)}
                  className="px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/50 transition-all"
                >
                  {RUN_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-5 py-2.5 gradient-brand text-white font-semibold rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all"
              >
                Enregistrer
              </button>
            </motion.form>
          )}
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Cette semaine", value: `${weekDistance.toFixed(1)} km`, color: "text-brand-700" },
            { label: "Allure moy.", value: avgPaceLabel, color: "text-blue-400" },
            { label: "Sorties", value: `${totalRuns}`, color: "text-muted-foreground" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-xl p-3 text-center"
            >
              <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        {logs.length > 1 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Distance &amp; allure</h3>
            <RunningChart data={logs} />
          </div>
        )}

        {/* History */}
        {logs.length > 0 ? (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Historique</h3>
            <div className="space-y-2">
              {[...logs].reverse().map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0 group"
                >
                  <div>
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
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{log.distance_km} km</span>
                    <button
                      onClick={() => removeRun(log.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <Footprints className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucune sortie enregistrée. Ajoute ta première course !</p>
          </div>
        )}
      </div>
    </div>
  );
}
