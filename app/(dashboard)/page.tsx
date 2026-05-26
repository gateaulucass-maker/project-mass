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
  const currentWeight = MOCK_BODYWEIGHT[MOCK_BODYWEIGHT.length - 1].weight;
  const today = format(new Date(), "EEEE dd MMMM", { locale: fr });
  const dayOfWeek = new Date().getDay();
  const sessionsThisWeek = dayOfWeek >= 1 ? Math.min(dayOfWeek, 4) : 0;

  const nextWorkout = MOCK_WORKOUTS[sessionsThisWeek % MOCK_WORKOUTS.length];

  const weightProgress = activeProgram?.start_weight && activeProgram?.target_weight
    ? Math.round(((currentWeight - activeProgram.start_weight) / (activeProgram.target_weight - activeProgram.start_weight)) * 100)
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
              Bonjour, {MOCK_USER.full_name?.split(" ")[0]} 👋
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <span className="text-base">🔥</span>
            <span className="text-sm font-bold text-orange-400">12 jours</span>
          </div>
        </motion.div>

        {/* Active Program Banner */}
        {activeProgram && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-card border border-border/50 rounded-2xl p-5 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-violet-glow opacity-40 pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full border", getProgramTypeColor(activeProgram.type))}>
                    {getProgramTypeLabel(activeProgram.type)}
                  </span>
                  <span className="text-xs text-muted-foreground">Programme actif</span>
                </div>
                <h2 className="text-lg font-bold">{activeProgram.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{activeProgram.goal}</p>
              </div>
              <Link href="/programs">
                <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors mt-1" />
              </Link>
            </div>

            {/* Progress bar */}
            <div className="mt-4 relative z-10">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">{activeProgram.start_weight} kg</span>
                <span className="font-semibold text-violet-400">{weightProgress}% de l&apos;objectif</span>
                <span className="text-muted-foreground">{activeProgram.target_weight} kg</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weightProgress}%` }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  className="h-full gradient-violet rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <StatsCards
          currentWeight={currentWeight}
          targetWeight={activeProgram?.target_weight ?? 85}
          sessionsThisWeek={sessionsThisWeek}
          weeklyFrequency={activeProgram?.weekly_frequency ?? 6}
          streak={12}
          calories={activeProgram?.calories_target ?? 3200}
        />

        {/* Next Workout CTA */}
        {nextWorkout && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href={`/workouts/${nextWorkout.id}`}>
              <div className="bg-card border border-border/50 rounded-2xl p-5 hover:border-violet-500/40 transition-all group card-hover flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl gradient-violet flex items-center justify-center flex-shrink-0 glow-violet-sm group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-violet-400 font-medium mb-0.5">Prochaine séance</p>
                  <p className="font-bold truncate">{nextWorkout.title}</p>
                  <p className="text-xs text-muted-foreground">{nextWorkout.exercises?.length} exercices · ~60 min</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
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
            className="bg-card border border-border/50 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Évolution du poids</h3>
                <p className="text-xs text-muted-foreground">4 dernières semaines</p>
              </div>
              <Link href="/weight" className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
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
            className="bg-card border border-border/50 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Fréquence d&apos;entraînement</h3>
                <p className="text-xs text-muted-foreground">Séances par semaine</p>
              </div>
              <Link href="/workouts" className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
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
          className="bg-card border border-border/50 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <div>
                <h3 className="font-semibold">Performances clés</h3>
                <p className="text-xs text-muted-foreground">Évolution des charges (kg)</p>
              </div>
            </div>
            <Link href="/progress" className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
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
          className="bg-card border border-border/50 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-400" />
              <div>
                <h3 className="font-semibold">Records personnels</h3>
                <p className="text-xs text-muted-foreground">Dernières performances</p>
              </div>
            </div>
            <Link href="/progress" className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <RecentPRs prs={MOCK_PERSONAL_RECORDS} />
        </motion.div>
      </div>
    </div>
  );
}
