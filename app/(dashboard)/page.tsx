"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dumbbell, ArrowRight, TrendingUp, Zap, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { WeightChart } from "@/components/dashboard/WeightChart";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { VolumeChart } from "@/components/dashboard/VolumeChart";
import { RecentPRs } from "@/components/dashboard/RecentPRs";
import {
  MOCK_PROGRAMS,
  MOCK_BODYWEIGHT,
  MOCK_PERSONAL_RECORDS,
  MOCK_WORKOUTS,
  MOCK_USER,
} from "@/lib/mock-data";
import { getWeekStorageKey } from "@/hooks/useWorkoutChecks";

// Mon→Push, Tue→Pull, Wed→Legs, Thu→Push, Fri→Pull, Sat→Legs, Sun→rest
function getTodayWorkoutIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? -1 : (day - 1) % 3;
}

export default function DashboardPage() {
  const lastProgram = MOCK_PROGRAMS[0];
  const currentWeight = MOCK_BODYWEIGHT[MOCK_BODYWEIGHT.length - 1].weight;
  const today = format(new Date(), "EEEE dd MMMM", { locale: fr });

  const sessionsThisWeek = 4;
  const weeklyFrequency = 4;
  const totalSessions = 47;

  const todayIndex = getTodayWorkoutIndex();
  const todayWorkout = todayIndex >= 0 ? MOCK_WORKOUTS[todayIndex] : null;

  const [todayDone, setTodayDone] = useState(0);

  useEffect(() => {
    if (!todayWorkout) return;
    try {
      const key = getWeekStorageKey(0);
      const raw = localStorage.getItem(key);
      const checked = new Set<string>(raw ? JSON.parse(raw) as string[] : []);
      const done = todayWorkout.exercises?.filter(e => checked.has(`${todayWorkout.id}_${e.id}`)).length ?? 0;
      setTodayDone(done);
    } catch {}
  }, [todayWorkout?.id]);

  const todayTotal = todayWorkout?.exercises?.length ?? 0;
  const todayComplete = todayDone > 0 && todayDone === todayTotal;

  return (
    <div className="flex-1">
      <Header />

      <div className="px-4 lg:px-6 py-5 space-y-5 max-w-6xl">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <p className="text-sm text-muted-foreground capitalize">{today}</p>
            <h1 className="text-2xl font-bold mt-0.5">
              Bonjour, {MOCK_USER.full_name?.split(" ")[0]}
            </h1>
          </div>
        </motion.div>

        {/* Programme terminé banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Objectif atteint
                </span>
                <span className="text-xs text-muted-foreground">{lastProgram.title}</span>
              </div>
              <h2 className="text-lg font-bold">90 kg atteints</h2>
              <p className="text-sm text-muted-foreground mt-1">+12 kg depuis la reprise — prochain programme à définir.</p>
            </div>
            <Link href="/programs">
              <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors mt-1" />
            </Link>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">{lastProgram.start_weight} kg</span>
              <span className="font-semibold text-emerald-600">100%</span>
              <span className="text-muted-foreground">{lastProgram.target_weight} kg</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-full bg-emerald-500 rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <StatsCards
          currentWeight={currentWeight}
          targetWeight={90}
          sessionsThisWeek={sessionsThisWeek}
          weeklyFrequency={weeklyFrequency}
          totalSessions={totalSessions}
        />

        {/* Séance du jour */}
        {todayWorkout ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Link href="/workouts">
              <div className={`bg-card border rounded-2xl p-5 hover:border-brand-700/40 transition-all group card-hover flex items-center gap-4 ${todayComplete ? "border-emerald-200" : "border-border"}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-105 ${todayComplete ? "bg-emerald-500" : "gradient-brand glow-brand-sm"}`}>
                  {todayComplete
                    ? <CheckCircle2 className="w-5 h-5 text-white" />
                    : <Dumbbell className="w-5 h-5 text-white" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium mb-0.5 ${todayComplete ? "text-emerald-600" : "text-brand-700"}`}>
                    Séance du jour
                  </p>
                  <p className="font-bold truncate">{todayWorkout.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{todayDone}/{todayTotal} exercices</p>
                    {todayDone > 0 && !todayComplete && (
                      <div className="flex-1 max-w-24 h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-brand rounded-full transition-all"
                          style={{ width: `${(todayDone / todayTotal) * 100}%` }}
                        />
                      </div>
                    )}
                    {todayComplete && (
                      <span className="text-xs font-semibold text-emerald-600">Terminée</span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-700 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">Jour de repos</p>
              <p className="text-xs text-muted-foreground">Récupération — profites-en.</p>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Weight Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Évolution du poids</h3>
                <p className="text-xs text-muted-foreground">Depuis la reprise</p>
              </div>
              <Link href="/weight" className="text-xs text-brand-700 hover:text-brand-400 transition-colors flex items-center gap-1">
                Voir tout <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <WeightChart data={MOCK_BODYWEIGHT} />
          </motion.div>

          {/* Volume Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Fréquence d&apos;entraînement</h3>
                <p className="text-xs text-muted-foreground">Séances par semaine</p>
              </div>
              <Link href="/workouts" className="text-xs text-brand-700 hover:text-brand-400 transition-colors flex items-center gap-1">
                Séances <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <VolumeChart />
          </motion.div>
        </div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-700" />
              <div>
                <h3 className="font-semibold">Performances clés</h3>
                <p className="text-xs text-muted-foreground">Évolution des charges (kg)</p>
              </div>
            </div>
            <Link href="/progress" className="text-xs text-brand-700 hover:text-brand-400 transition-colors flex items-center gap-1">
              Détails <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <PerformanceChart />
        </motion.div>

        {/* Recent PRs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-700" />
              <div>
                <h3 className="font-semibold">Records personnels</h3>
                <p className="text-xs text-muted-foreground">Dernières performances</p>
              </div>
            </div>
            <Link href="/progress" className="text-xs text-brand-700 hover:text-brand-400 transition-colors flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <RecentPRs prs={MOCK_PERSONAL_RECORDS} />
        </motion.div>
      </div>
    </div>
  );
}
