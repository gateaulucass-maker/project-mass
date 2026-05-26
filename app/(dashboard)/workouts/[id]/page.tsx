"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Clock, Dumbbell, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { MOCK_WORKOUTS } from "@/lib/mock-data";
import { getWorkoutTypeColor, getWorkoutTypeLabel, getMuscleGroupLabel, cn } from "@/lib/utils";
import Link from "next/link";

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workout = MOCK_WORKOUTS.find(w => w.id === params.id) ?? MOCK_WORKOUTS[0];
  const [expandedEx, setExpandedEx] = useState<string | null>(null);

  const estimatedTime = (workout.exercises?.length ?? 0) * 12;

  return (
    <div className="flex-1">
      <Header />

      <div className="px-4 lg:px-6 py-5 max-w-2xl">
        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center hover:bg-secondary transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", getWorkoutTypeColor(workout.workout_type))}>
                {getWorkoutTypeLabel(workout.workout_type)}
              </span>
            </div>
            <h1 className="font-bold text-lg leading-tight truncate">{workout.title}</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Exercices", value: String(workout.exercises?.length ?? 0), icon: Dumbbell },
            { label: "Durée est.", value: `~${estimatedTime}min`, icon: Clock },
            { label: "Séries tot.", value: String(workout.exercises?.reduce((s, e) => s + e.sets, 0) ?? 0), icon: RotateCcw },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border/50 rounded-xl p-3 text-center">
              <stat.icon className="w-4 h-4 text-violet-400 mx-auto mb-1" />
              <p className="font-bold text-sm">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Start Button */}
        <Link href={`/workouts/active?workout=${workout.id}`}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 gradient-violet text-white font-bold text-base rounded-2xl glow-violet flex items-center justify-center gap-3 mb-6 hover:opacity-90 transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
            Démarrer la séance
          </motion.button>
        </Link>

        {/* Exercises list */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Exercices ({workout.exercises?.length})</h2>

          {workout.exercises?.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border/50 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedEx(expandedEx === ex.id ? null : ex.id)}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-violet-400">
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{ex.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ex.sets}×{ex.reps} · {ex.weight} kg · repos {ex.rest_time}s
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-lg">
                    {getMuscleGroupLabel(ex.muscle_group)}
                  </span>
                  {expandedEx === ex.id ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expandedEx === ex.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4 border-t border-border/40"
                >
                  <div className="pt-3 grid grid-cols-4 gap-2">
                    {Array.from({ length: ex.sets }).map((_, si) => (
                      <div key={si} className="bg-secondary/40 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Série {si + 1}</p>
                        <p className="font-bold text-sm">{ex.reps}</p>
                        <p className="text-xs text-muted-foreground">{ex.weight}kg</p>
                      </div>
                    ))}
                  </div>
                  {ex.notes && (
                    <p className="text-xs text-muted-foreground mt-3 px-1">💡 {ex.notes}</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
