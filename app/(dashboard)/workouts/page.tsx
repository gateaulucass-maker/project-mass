"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, ChevronLeft, ChevronRight, Check, Pencil, X } from "lucide-react";
import { format, startOfWeek, addWeeks, getISOWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { MOCK_WORKOUTS } from "@/lib/mock-data";
import { getWorkoutTypeLabel } from "@/lib/utils";
import { useWorkoutChecks } from "@/hooks/useWorkoutChecks";

// Mon→Push, Tue→Pull, Wed→Legs, Thu→Push, Fri→Pull, Sat→Legs, Sun→rest
function getTodayWorkoutId(): string | null {
  const day = new Date().getDay();
  if (day === 0) return null;
  return MOCK_WORKOUTS[(day - 1) % 3]?.id ?? null;
}

interface ExerciseOverride {
  weight?: number;
  reps?: number;
}

const OVERRIDES_KEY = "pm_exercise_overrides";

export default function WorkoutsPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { checked, toggle } = useWorkoutChecks(weekOffset);

  const [overrides, setOverrides] = useState<Record<string, ExerciseOverride>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editReps, setEditReps] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(OVERRIDES_KEY);
      if (raw) setOverrides(JSON.parse(raw));
    } catch {}
  }, []);

  function openEdit(exerciseId: string, currentWeight: number, currentReps: number) {
    const ov = overrides[exerciseId];
    setEditWeight(String(ov?.weight ?? currentWeight));
    setEditReps(String(ov?.reps ?? currentReps));
    setEditingId(exerciseId);
  }

  function saveEdit(exerciseId: string) {
    const w = parseFloat(editWeight);
    const r = parseInt(editReps);
    if (isNaN(w) || isNaN(r)) { setEditingId(null); return; }
    const next = { ...overrides, [exerciseId]: { weight: w, reps: r } };
    setOverrides(next);
    try { localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next)); } catch {}
    setEditingId(null);
  }

  const baseDate = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekNum = getISOWeek(baseDate);
  const monthLabel = format(baseDate, "MMMM yyyy", { locale: fr });
  const todayWorkoutId = weekOffset === 0 ? getTodayWorkoutId() : null;

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
            <p className="font-bold text-sm">
              Semaine {weekNum}
              {weekOffset === 0 && (
                <span className="ml-2 text-[10px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded-full">
                  Cette semaine
                </span>
              )}
            </p>
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
          const isToday = workout.id === todayWorkoutId;
          const doneCount = exercises.filter(e => checked.has(`${workout.id}_${e.id}`)).length;
          const allDone = doneCount === exercises.length && exercises.length > 0;
          const pct = exercises.length > 0 ? (doneCount / exercises.length) * 100 : 0;

          return (
            <div
              key={workout.id}
              className={`bg-card border rounded-2xl overflow-hidden ${isToday ? "border-brand-700/30 shadow-[0_0_20px_rgba(185,28,28,0.07)]" : "border-border"}`}
            >
              {isToday && <div className="h-0.5 gradient-brand w-full" />}

              {/* Block header */}
              <div className={`px-5 py-4 border-b border-border flex items-center justify-between transition-colors ${allDone ? "bg-emerald-50/60" : ""}`}>
                <div>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider">
                      {getWorkoutTypeLabel(workout.workout_type)}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded-full">
                        Aujourd'hui
                      </span>
                    )}
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
                  const id = `${workout.id}_${exercise.id}`;
                  const done = checked.has(id);
                  const isEditing = editingId === exercise.id;
                  const ov = overrides[exercise.id];
                  const displayWeight = ov?.weight ?? exercise.weight;
                  const displayReps = ov?.reps ?? exercise.reps;
                  const hasOverride = ov?.weight !== undefined || ov?.reps !== undefined;

                  return (
                    <div key={exercise.id}>
                      {/* Main row */}
                      <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/20 transition-colors">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggle(id)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            done ? "bg-brand-700 border-brand-700" : "border-border bg-white"
                          }`}
                        >
                          {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </button>

                        {/* Info — click to edit */}
                        <button
                          onClick={() => isEditing ? setEditingId(null) : openEdit(exercise.id, exercise.weight, exercise.reps)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <p className={`text-sm font-medium leading-tight ${done ? "text-muted-foreground line-through" : ""}`}>
                            {exercise.name}
                            {hasOverride && <span className="ml-1.5 text-[10px] font-bold text-brand-700">modifié</span>}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {exercise.sets} × {displayReps === 1 ? "tenu" : `${displayReps} reps`}
                            {displayWeight > 0 ? ` · ${displayWeight} kg` : ""}
                          </p>
                        </button>

                        {/* Edit toggle */}
                        <button
                          onClick={() => isEditing ? setEditingId(null) : openEdit(exercise.id, exercise.weight, exercise.reps)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${isEditing ? "bg-brand-50 text-brand-700" : "text-muted-foreground/50 hover:text-muted-foreground"}`}
                        >
                          {isEditing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Inline edit panel */}
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-4 pt-2 bg-brand-50/40 border-t border-brand-100 flex items-end gap-3">
                              <div className="flex-1 space-y-1">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Poids (kg)</label>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={editWeight}
                                  onChange={e => setEditWeight(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-700/40 transition-all"
                                  autoFocus
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Reps</label>
                                <input
                                  type="number"
                                  value={editReps}
                                  onChange={e => setEditReps(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-700/40 transition-all"
                                />
                              </div>
                              <button
                                onClick={() => saveEdit(exercise.id)}
                                className="px-4 py-2 gradient-brand text-white text-sm font-semibold rounded-lg hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
                              >
                                OK
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-secondary">
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`h-full ${allDone ? "bg-emerald-500" : "bg-brand-700"}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
