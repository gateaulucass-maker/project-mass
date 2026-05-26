"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { format, startOfWeek, addWeeks, getISOWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { MOCK_WORKOUTS } from "@/lib/mock-data";
import { getWorkoutTypeLabel } from "@/lib/utils";

export default function WorkoutsPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const baseDate = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekNum = getISOWeek(baseDate);
  const monthLabel = format(baseDate, "MMMM yyyy", { locale: fr });

  function toggle(key: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="flex-1">
      <Header title="Séances" subtitle="Suivi de tes entraînements" />

      <div className="px-4 lg:px-6 py-5 max-w-3xl space-y-5">
        <PageHeader title="Séances" icon={Dumbbell} />

        {/* Week selector */}
        <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3.5">
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/70 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="font-bold text-sm">Semaine {weekNum}</p>
            <p className="text-xs text-muted-foreground capitalize">{monthLabel}</p>
          </div>
          <button
            onClick={() => setWeekOffset(o => o + 1)}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/70 active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Workout blocks */}
        {MOCK_WORKOUTS.map((workout, wi) => {
          const exercises = workout.exercises ?? [];
          const doneCount = exercises.filter(e =>
            checked.has(`${weekOffset}-${workout.id}-${e.id}`)
          ).length;
          const allDone = doneCount === exercises.length && exercises.length > 0;
          const pct = exercises.length > 0 ? (doneCount / exercises.length) * 100 : 0;

          return (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: wi * 0.08 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              {/* Block header */}
              <div className={`px-5 py-4 border-b border-border flex items-center justify-between transition-colors ${allDone ? "bg-emerald-50/60" : ""}`}>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider">
                      {getWorkoutTypeLabel(workout.workout_type)}
                    </span>
                    {allDone && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                        Terminé
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-sm leading-tight">{workout.title}</p>
                </div>
                <span className="text-xs text-muted-foreground font-semibold tabular-nums">
                  {doneCount}/{exercises.length}
                </span>
              </div>

              {/* Exercise rows */}
              <div className="divide-y divide-border/40">
                {exercises.map(exercise => {
                  const key = `${weekOffset}-${workout.id}-${exercise.id}`;
                  const done = checked.has(key);

                  return (
                    <button
                      key={exercise.id}
                      onClick={() => toggle(key)}
                      className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/40 active:bg-secondary/60 transition-colors text-left"
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        done ? "bg-brand-700 border-brand-700" : "border-border bg-white"
                      }`}>
                        {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium transition-colors leading-tight ${done ? "text-muted-foreground line-through" : ""}`}>
                          {exercise.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {exercise.sets} × {exercise.reps === 1 ? "tenu" : `${exercise.reps} reps`}
                          {exercise.weight > 0 ? ` · ${exercise.weight} kg` : ""}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-secondary">
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-full bg-brand-700"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
