"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dumbbell, ArrowRight, TrendingUp, Zap, Play, ChevronRight } from "lucide-react";
import Link from "next/link";
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
import { getProgramTypeColor, getProgramTypeLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const activeProgram = MOCK_PROGRAMS.find(p => p.is_active);
  const lastProgram = MOCK_PROGRAMS[0]; // PPL terminé
  const currentWeight = MOCK_BODYWEIGHT[MOCK_BODYWEIGHT.length - 1].weight;
  const today = format(new Date(), "EEEE dd MMMM", { locale: fr });

  // Séances cette semaine : 4/4
  const sessionsThisWeek = 4;
  const weeklyFrequency = 4;
  const totalSessions = 47;

  // Prochaine séance : rotation Push → Pull → Legs (basé sur le jour)
  const cycleIndex = new Date().getDay() % 3;
  const nextWorkout = MOCK_WORKOUTS[cycleIndex];

  const weightProgress = lastProgram?.start_weight && lastProgram?.target_weight
    ? Math.min(100, Math.round(((currentWeight - lastProgram.start_weight) / (lastProgram.target_weight - lastProgram.start_weight)) * 100))
    : 0;

  return (
    <div className="flex-1">
      <Header />

      <div className="px-4 lg:px-6 py-5 space-y-6 max-w-6xl">
        {/* Welcome header */}
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

        {/* Programme termine — banner recap */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
              <p className="text-sm text-muted-foreground mt-1">+12 kg depuis la reprise — prochain programme a definir.</p>
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

        {/* Stats Grid */}
        <StatsCards
          currentWeight={currentWeight}
          targetWeight={90}
          sessionsThisWeek={sessionsThisWeek}
          weeklyFrequency={weeklyFrequency}
          totalSessions={totalSessions}
        />

        {/* Next Workout CTA */}
        {nextWorkout && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href={`/workouts/${nextWorkout.id}`}>
              <div className="bg-card border border-border rounded-2xl p-5 hover:border-brand-700/40 transition-all group card-hover flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center flex-shrink-0 glow-brand-sm group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-brand-700 font-medium mb-0.5">Prochaine séance</p>
                  <p className="font-bold truncate">{nextWorkout.title}</p>
                  <p className="text-xs text-muted-foreground">{nextWorkout.exercises?.length} exercices · ~60 min</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-700 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Weight Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Évolution du poids</h3>
                <p className="text-xs text-muted-foreground">4 dernières semaines</p>
              </div>
              <Link href="/weight" className="text-xs text-brand-700 hover:text-brand-400 transition-colors flex items-center gap-1">
                Voir tout <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <WeightChart data={MOCK_BODYWEIGHT} targetWeight={activeProgram?.target_weight} />
          </motion.div>

          {/* Volume Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Fréquence d&apos;entraînement</h3>
                <p className="text-xs text-muted-foreground">Séances par semaine</p>
              </div>
              <Link href="/workouts" className="text-xs text-brand-700 hover:text-brand-400 transition-colors flex items-center gap-1">
                Voir tout <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <VolumeChart />
          </motion.div>
        </div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
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
          transition={{ delay: 0.4 }}
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
