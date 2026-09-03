"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Waves, Plus, Trash2 } from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { SwimmingChart } from "@/components/dashboard/SwimmingChart";
import { SkeletonCard } from "@/components/shared/LoadingSpinner";
import { useLocalSwimming } from "@/hooks/useLocalSwimming";
import { formatPacePer100m, getSwimStrokeLabel } from "@/lib/utils";
import type { SwimStroke, PoolLength } from "@/types";

const STROKES: { value: SwimStroke; label: string }[] = [
  { value: "crawl", label: "Crawl" },
  { value: "breaststroke", label: "Brasse" },
  { value: "backstroke", label: "Dos" },
  { value: "butterfly", label: "Papillon" },
  { value: "mixed", label: "Mixte" },
];

export default function SwimmingPage() {
  const { logs, loading, addSwim, removeSwim } = useLocalSwimming();
  const [adding, setAdding] = useState(false);
  const [laps, setLaps] = useState("");
  const [poolLength, setPoolLength] = useState<PoolLength>(25);
  const [duration, setDuration] = useState("");
  const [stroke, setStroke] = useState<SwimStroke>("crawl");

  const totalDistance = logs.reduce((s, l) => s + l.distance_m, 0);
  const totalSwims = logs.length;
  const lastSwim = logs[logs.length - 1];

  const thisWeek = logs.filter((l) => {
    const now = new Date();
    return isWithinInterval(parseISO(l.created_at), {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    });
  });
  const weekDistance = thisWeek.reduce((s, l) => s + l.distance_m, 0);

  const totalDuration = logs.reduce((s, l) => s + l.duration_min, 0);
  const avgPaceMin = totalDistance > 0 ? totalDuration / (totalDistance / 100) : 0;
  const avgPaceLabel = totalDistance > 0
    ? `${Math.floor(avgPaceMin)}:${String(Math.round((avgPaceMin - Math.floor(avgPaceMin)) * 60)).padStart(2, "0")}/100m`
    : "—";

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const l = parseInt(laps);
    const t = parseFloat(duration);
    if (!l || l <= 0 || l > 500) { toast.error("Nombre de longueurs invalide"); return; }
    if (!t || t <= 0 || t > 600) { toast.error("Durée invalide"); return; }
    addSwim({ laps: l, pool_length: poolLength, duration_min: t, stroke });
    setLaps("");
    setDuration("");
    setStroke("crawl");
    setAdding(false);
    toast.success(`${l * poolLength} m enregistrés ✓`);
  }

  if (loading) return (
    <div className="flex-1 px-4 lg:px-6 py-5 space-y-4">
      <SkeletonCard className="h-32" />
      <SkeletonCard className="h-64" />
    </div>
  );

  return (
    <div className="flex-1">
      <Header title="Piscine" subtitle="Toutes tes séances de natation" />

      <div className="px-4 lg:px-6 py-5 max-w-3xl space-y-5">
        <PageHeader title="Piscine" icon={Waves} />

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-end justify-between relative z-10">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Distance totale nagée</p>
              <p className="text-5xl font-black">
                {totalDistance >= 1000 ? (totalDistance / 1000).toFixed(1) : totalDistance}
                <span className="text-2xl font-bold text-muted-foreground ml-1">{totalDistance >= 1000 ? "km" : "m"}</span>
              </p>
              {lastSwim && (
                <p className="text-sm text-muted-foreground mt-2">
                  Dernière séance : {format(parseISO(lastSwim.created_at), "dd MMM", { locale: fr })} · {lastSwim.distance_m} m
                </p>
              )}
            </div>
            <button
              onClick={() => setAdding(!adding)}
              className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30 hover:opacity-90 active:scale-95 transition-all"
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
                  step="1"
                  value={laps}
                  onChange={(e) => setLaps(e.target.value)}
                  placeholder="Nb de longueurs"
                  autoFocus
                  className="px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                />
                <select
                  value={poolLength}
                  onChange={(e) => setPoolLength(Number(e.target.value) as PoolLength)}
                  className="px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                >
                  <option value={25}>Bassin 25m</option>
                  <option value={50}>Bassin 50m</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Durée (min)"
                  className="px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                />
                <select
                  value={stroke}
                  onChange={(e) => setStroke(e.target.value as SwimStroke)}
                  className="px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                >
                  {STROKES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              {laps && (
                <p className="text-xs text-muted-foreground text-center">
                  = {(parseInt(laps) || 0) * poolLength} m
                </p>
              )}
              <button
                type="submit"
                className="w-full px-5 py-2.5 bg-sky-500 text-white font-semibold rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all"
              >
                Enregistrer
              </button>
            </motion.form>
          )}
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Cette semaine", value: `${weekDistance} m`, color: "text-sky-500" },
            { label: "Allure moy.", value: avgPaceLabel, color: "text-brand-700" },
            { label: "Séances", value: `${totalSwims}`, color: "text-muted-foreground" },
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
            <SwimmingChart data={logs} />
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
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border text-sky-500 bg-sky-500/10 border-sky-500/20">
                        {getSwimStrokeLabel(log.stroke)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatPacePer100m(log.duration_min, log.distance_m)} · {log.duration_min} min · {log.laps}×{log.pool_length}m
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{log.distance_m} m</span>
                    <button
                      onClick={() => removeSwim(log.id)}
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
            <Waves className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucune séance enregistrée. Ajoute ta première séance !</p>
          </div>
        )}
      </div>
    </div>
  );
}
