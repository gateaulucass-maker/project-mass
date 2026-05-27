"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
// motion utilisé uniquement pour la barre de progression
import { fr } from "date-fns/locale";
import { Dumbbell, ArrowRight, TrendingUp, Zap, CheckCircle2, ChevronRight, Flame } from "lucide-react";
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
import { differenceInDays, parseISO } from "date-fns";
import { calculateWeightProgress } from "@/lib/utils";

export default function DashboardPage() {
  const activeProgram = MOCK_PROGRAMS.find(p => p.is_active) ?? MOCK_PROGRAMS[0];
  const currentWeight = MOCK_BODYWEIGHT[MOCK_BODYWEIGHT.length - 1].weight;
  const today = format(new Date(), "EEEE dd MMMM", { locale: fr });

  const weeklyFrequency = 3;
  const totalSessions = 47;

  const daysLeft = activeProgram.end_date
    ? differenceInDays(parseISO(activeProgram.end_date), new Date())
    : null;

  const weightProgress = activeProgram.start_weight && activeProgram.target_weight
    ? calculateWeightProgress(currentWeight, activeProgram.start_weight, activeProgram.target_weight)
    : 0;

  const [todayWorkout, setTodayWorkout] = useState<typeof MOCK_WORKOUTS[0] | null>(null);
  const [todayDone, setTodayDone] = useState(0);
  const [sessionsThisWeek, setSessionsThisWeek] = useState(0);

  useEffect(() => {
    function compute() {
      const day = new Date().getDay();

      function parseChecks(key: string): Set<string> {
        try {
          const raw = localStorage.getItem(key);
          return new Set(raw ? JSON.parse(raw) as string[] : []);
        } catch { return new Set(); }
      }

      function doneWorkouts(checks: Set<string>): Set<string> {
        const ids = new Set<string>();
        for (const id of checks) {
          const wId = id.split("_")[0];
          if (MOCK_WORKOUTS.some(w => w.id === wId)) ids.add(wId);
        }
        return ids;
      }

      const thisWeekChecks = parseChecks(getWeekStorageKey(0));
      const thisWeekDone   = doneWorkouts(thisWeekChecks);
      setSessionsThisWeek(thisWeekDone.size);

      if (day === 0) return;

      let nextIndex = 0;
      if (thisWeekDone.size > 0) {
        nextIndex = thisWeekDone.size % 3;
      } else {
        const prevDone = doneWorkouts(parseChecks(getWeekStorageKey(-1)));
        nextIndex = prevDone.size % 3;
      }

      const workout = MOCK_WORKOUTS[nextIndex];
      setTodayWorkout(workout);
      const done = workout.exercises?.filter(e => thisWeekChecks.has(`${workout.id}_${e.id}`)).length ?? 0;
      setTodayDone(done);
    }

    compute();

    function onStorage(e: StorageEvent) {
      if (e.key?.startsWith("pm_checks_")) compute();
    }
    function onVisible() {
      if (document.visibilityState === "visible") compute();
    }
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const todayTotal = todayWorkout?.exercises?.length ?? 0;
  const todayComplete = todayDone > 0 && todayDone === todayTotal;

  return (
    <div className="flex-1">
      <Header />

      <div className="px-4 lg:px-6 py-5 space-y-5 max-w-6xl">
        {/* Welcome */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground capitalize">{today}</p>
            <h1 className="text-2xl font-bold mt-0.5">
              Bonjour, {MOCK_USER.full_name?.split(" ")[0]}
            </h1>
          </div>
        </div>

        {/* Programme actif banner */}
        <div className="relative bg-card border border-brand-700/20 rounded-2xl p-5 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-50 rounded-full blur-3xl pointer-events-none" />
          <div className="h-0.5 gradient-brand absolute top-0 left-0 right-0" />
          <div className="flex items-start justify-between relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-700 animate-pulse" />
                  En cours
                </span>
                {daysLeft !== null && daysLeft >= 0 && (
                  <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${daysLeft <= 7 ? "bg-orange-50 text-orange-600 border border-orange-200" : "bg-secondary text-muted-foreground border border-border"}`}>
                    <Flame className="w-3 h-3" />
                    {daysLeft}j restants
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold">{activeProgram.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Objectif : {activeProgram.target_weight} kg · {currentWeight} kg actuellement
              </p>
            </div>
            <Link href="/programs">
              <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-brand-700 transition-colors mt-1" />
            </Link>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">{activeProgram.start_weight} kg</span>
              <span className="font-semibold text-brand-700">{Math.round(weightProgress)}%</span>
              <span className="text-muted-foreground">{activeProgram.target_weight} kg</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${weightProgress}%` }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                className="h-full gradient-brand rounded-full"
              />
            </div>
          </div>
        </div>

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
          <div>
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
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">Jour de repos</p>
              <p className="text-xs text-muted-foreground">Récupération — profites-en.</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Weight Chart */}
          <div className="bg-card border border-border rounded-2xl p-5">
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
          </div>

          {/* Volume Chart */}
          <div className="bg-card border border-border rounded-2xl p-5">
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
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
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
        </div>

        {/* Recent PRs */}
        <div className="bg-card border border-border rounded-2xl p-5">
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
        </div>
      </div>
    </div>
  );
}
