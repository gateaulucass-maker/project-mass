"use client";

import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { WorkoutCard } from "@/components/workouts/WorkoutCard";
import { MOCK_PROGRAMS, MOCK_WORKOUTS } from "@/lib/mock-data";
import { getWorkoutTypeLabel } from "@/lib/utils";

const workoutTypes = ["push", "pull", "legs", "upper", "lower"] as const;

export default function WorkoutsPage() {
  const activeProgram = MOCK_PROGRAMS.find(p => p.is_active);
  const workouts = activeProgram?.workouts ?? MOCK_WORKOUTS;

  const grouped = workoutTypes.reduce<Record<string, typeof workouts>>((acc, type) => {
    const filtered = workouts.filter(w => w.workout_type === type);
    if (filtered.length > 0) acc[type] = filtered;
    return acc;
  }, {});

  return (
    <div className="flex-1">
      <Header title="Séances" subtitle="Toutes tes séances d'entraînement" />

      <div className="px-4 lg:px-6 py-5 max-w-3xl space-y-6">
        <PageHeader title="Séances" icon={Dumbbell} />

        {activeProgram && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3.5 bg-violet-500/10 border border-violet-500/20 rounded-2xl"
          >
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-violet-300">{activeProgram.title}</p>
              <p className="text-xs text-violet-400/70">{activeProgram.weekly_frequency} séances/semaine · {workouts.length} templates</p>
            </div>
          </motion.div>
        )}

        {Object.entries(grouped).map(([type, list]) => (
          <div key={type}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {getWorkoutTypeLabel(type)} — {list.length} séance{list.length > 1 ? "s" : ""}
            </h2>
            <div className="space-y-2">
              {list.map((workout, i) => (
                <WorkoutCard key={workout.id} workout={workout} index={i} />
              ))}
            </div>
          </div>
        ))}

        {/* Other workouts not in known types */}
        {workouts.filter(w => !workoutTypes.includes(w.workout_type as any)).map((workout, i) => (
          <WorkoutCard key={workout.id} workout={workout} index={i} />
        ))}
      </div>
    </div>
  );
}
