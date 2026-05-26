"use client";

import { motion } from "framer-motion";
import { TrendingUp, Trophy, Zap } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { RecentPRs } from "@/components/dashboard/RecentPRs";
import { VolumeChart } from "@/components/dashboard/VolumeChart";
import { MOCK_PERSONAL_RECORDS, MOCK_WEEKLY_STATS } from "@/lib/mock-data";
import { formatVolume } from "@/lib/utils";

const KEY_LIFTS = [
  { name: "Développé couché", current: 105, prev: 100, reps: 3, emoji: "🏋️" },
  { name: "Squat", current: 147.5, prev: 140, reps: 3, emoji: "🦵" },
  { name: "Soulevé de terre", current: 175, prev: 165, reps: 2, emoji: "💪" },
  { name: "Développé militaire", current: 75, prev: 72.5, reps: 5, emoji: "🔝" },
];

export default function ProgressPage() {
  const totalVolume = MOCK_WEEKLY_STATS.reduce((s, w) => s + w.volume, 0);
  const avgVolume = Math.round(totalVolume / MOCK_WEEKLY_STATS.length);
  const lastWeekVolume = MOCK_WEEKLY_STATS[MOCK_WEEKLY_STATS.length - 1].volume;
  const weekChange = ((lastWeekVolume - MOCK_WEEKLY_STATS[MOCK_WEEKLY_STATS.length - 2].volume) / MOCK_WEEKLY_STATS[MOCK_WEEKLY_STATS.length - 2].volume * 100);

  return (
    <div className="flex-1">
      <Header title="Progression" subtitle="Analyse tes performances" />

      <div className="px-4 lg:px-6 py-5 max-w-4xl space-y-6">
        <PageHeader title="Progression" icon={TrendingUp} />

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: "PRs ce mois", value: "5", change: "+3 nouveaux", up: true },
            { label: "Volume moy.", value: formatVolume(avgVolume), change: "par semaine", up: true },
            { label: "Progression globale", value: "+22%", change: "depuis le début", up: true },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <p className="text-2xl font-black text-brand-700">{stat.value}</p>
              <p className="text-sm font-medium mt-0.5">{stat.label}</p>
              <p className={`text-xs mt-0.5 ${stat.up ? "text-emerald-400" : "text-red-400"}`}>{stat.change}</p>
            </motion.div>
          ))}
        </div>

        {/* Key lifts PRs */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-brand-700" />
            <h3 className="font-semibold">Mouvements clés</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {KEY_LIFTS.map((lift, i) => {
              const progress = ((lift.current - lift.prev) / lift.prev * 100);
              return (
                <motion.div
                  key={lift.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-secondary/40 rounded-xl p-3.5 border border-border/40"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-lg">{lift.emoji}</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                      +{progress.toFixed(1)}%
                    </span>
                  </div>
                  <p className="font-black text-xl">{lift.current} kg</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{lift.name}</p>
                  <p className="text-xs text-muted-foreground">{lift.reps} reps · PR</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Performance chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-brand-700" />
            <div>
              <h3 className="font-semibold">Évolution des charges</h3>
              <p className="text-xs text-muted-foreground">Mouvements de base (kg)</p>
            </div>
          </div>
          <PerformanceChart />
        </div>

        {/* Volume chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Volume hebdomadaire</h3>
              <p className="text-xs text-muted-foreground">Nombre de séances</p>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${weekChange >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
              {weekChange >= 0 ? "+" : ""}{weekChange.toFixed(0)}% vs sem. préc.
            </span>
          </div>
          <VolumeChart />
        </div>

        {/* Recent PRs */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-brand-700" />
            <h3 className="font-semibold">Records personnels récents</h3>
          </div>
          <RecentPRs prs={MOCK_PERSONAL_RECORDS} />
        </div>
      </div>
    </div>
  );
}
