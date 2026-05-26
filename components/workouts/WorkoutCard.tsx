"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Dumbbell, ChevronRight, Clock } from "lucide-react";
import type { Workout } from "@/types";
import { getWorkoutTypeColor, getWorkoutTypeLabel, cn } from "@/lib/utils";

interface WorkoutCardProps {
  workout: Workout;
  index: number;
}

export function WorkoutCard({ workout, index }: WorkoutCardProps) {
  const exerciseCount = workout.exercises?.length ?? 0;
  const estimatedTime = exerciseCount * 12; // ~12 min per exercise rough estimate

  const muscleGroups = [...new Set(workout.exercises?.map(e => e.muscle_group) ?? [])].slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link href={`/workouts/${workout.id}`}>
        <div className="bg-card border border-border/50 rounded-2xl p-4 hover:border-violet-500/30 transition-all group card-hover">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="w-11 h-11 rounded-xl bg-secondary/70 border border-border/50 flex items-center justify-center flex-shrink-0 group-hover:gradient-violet group-hover:border-transparent transition-all">
              <Dumbbell className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", getWorkoutTypeColor(workout.workout_type))}>
                  {getWorkoutTypeLabel(workout.workout_type)}
                </span>
              </div>
              <p className="font-semibold text-sm leading-tight truncate">{workout.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">{exerciseCount} exercices</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />~{estimatedTime} min
                </span>
              </div>
            </div>

            {/* Action */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Muscle tags */}
          {muscleGroups.length > 0 && (
            <div className="flex gap-1.5 mt-3 pl-[60px]">
              {muscleGroups.map(m => (
                <span key={m} className="text-[10px] px-2 py-0.5 bg-secondary/60 rounded-full text-muted-foreground border border-border/30">
                  {m}
                </span>
              ))}
              {(workout.exercises?.length ?? 0) > 3 && (
                <span className="text-[10px] px-2 py-0.5 bg-secondary/60 rounded-full text-muted-foreground border border-border/30">
                  +{exerciseCount - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
