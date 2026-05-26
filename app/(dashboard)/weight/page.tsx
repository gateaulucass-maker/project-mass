"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { WeightChart } from "@/components/dashboard/WeightChart";
import { SkeletonCard } from "@/components/shared/LoadingSpinner";
import { useBodyweight } from "@/hooks/useBodyweight";
import { usePrograms } from "@/hooks/usePrograms";

export default function WeightPage() {
  const { logs, loading, addWeight } = useBodyweight();
  const { activeProgram } = usePrograms();
  const [newWeight, setNewWeight] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const latest = logs[logs.length - 1];
  const firstLog = logs[0];
  const totalChange = latest && firstLog ? latest.weight - firstLog.weight : 0;

  const thisWeek = logs.filter(l => {
    const now = new Date();
    return isWithinInterval(parseISO(l.created_at), {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    });
  });
  const weekAvg = thisWeek.length > 0
    ? thisWeek.reduce((s, l) => s + l.weight, 0) / thisWeek.length
    : latest?.weight ?? 0;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!w || w < 30 || w > 300) { toast.error("Poids invalide"); return; }
    setSaving(true);
    const result = await addWeight(w);
    setSaving(false);
    if (result) {
      setNewWeight("");
      setAdding(false);
      toast.success(`${w} kg enregistré ✓`);
    } else {
      toast.error("Erreur — mode démo, configure Google Sheets d'abord");
    }
  }

  if (loading) return (
    <div className="flex-1 px-4 lg:px-6 py-5 space-y-4">
      <SkeletonCard className="h-32" />
      <SkeletonCard className="h-64" />
    </div>
  );

  return (
    <div className="flex-1">
      <Header title="Suivi poids" subtitle="Ton évolution corporelle" />

      <div className="px-4 lg:px-6 py-5 max-w-3xl space-y-5">
        <PageHeader title="Suivi poids" icon={Scale} />

        {/* Current weight hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-700/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-end justify-between relative z-10">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Poids actuel</p>
              <p className="text-5xl font-black">
                {latest?.weight.toFixed(1) ?? "—"}
                <span className="text-2xl font-bold text-muted-foreground ml-1">kg</span>
              </p>
              {latest && firstLog && (
                <div className="flex items-center gap-1.5 mt-2">
                  {totalChange > 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                  <span className={`text-sm font-semibold ${totalChange > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {totalChange > 0 ? "+" : ""}{totalChange.toFixed(1)} kg depuis le début
                  </span>
                </div>
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
              className="mt-4 pt-4 border-t border-border flex gap-3"
            >
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                placeholder="Ex: 81.5"
                autoFocus
                className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/50 transition-all"
              />
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 gradient-brand text-white font-semibold rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? "..." : "Enregistrer"}
              </button>
            </motion.form>
          )}
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Objectif", value: activeProgram?.target_weight ? `${activeProgram.target_weight} kg` : "—", color: "text-brand-700" },
            { label: "Moy. semaine", value: `${weekAvg.toFixed(1)} kg`, color: "text-blue-400" },
            { label: "Départ", value: firstLog ? `${firstLog.weight} kg` : "—", color: "text-muted-foreground" },
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
            <h3 className="font-semibold mb-4">Évolution du poids</h3>
            <WeightChart data={logs} targetWeight={activeProgram?.target_weight} />
          </div>
        )}

        {/* Progress to target */}
        {activeProgram?.target_weight && activeProgram?.start_weight && latest && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progression vers l&apos;objectif</span>
              <span className="font-semibold text-brand-700">
                {Math.round(((latest.weight - activeProgram.start_weight) / (activeProgram.target_weight - activeProgram.start_weight)) * 100)}%
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, ((latest.weight - activeProgram.start_weight) / (activeProgram.target_weight - activeProgram.start_weight)) * 100))}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full gradient-brand rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
              <span>{activeProgram.start_weight} kg</span>
              <span>{activeProgram.target_weight} kg</span>
            </div>
          </div>
        )}

        {/* History */}
        {logs.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Historique</h3>
            <div className="space-y-2">
              {[...logs].reverse().slice(0, 15).map((log, i) => {
                const idx = logs.indexOf(log);
                const prev = idx > 0 ? logs[idx - 1] : null;
                const diff = prev ? log.weight - prev.weight : 0;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {format(parseISO(log.created_at), "EEEE dd MMM", { locale: fr })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(log.created_at), "HH:mm")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {diff !== 0 && (
                        <span className={`text-xs font-medium ${diff > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                        </span>
                      )}
                      <span className="font-bold">{log.weight.toFixed(1)} kg</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
