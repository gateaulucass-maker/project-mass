"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, Check } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Header } from "@/components/layout/Header";
import { useLocalPrograms } from "@/hooks/useLocalPrograms";
import { getProgramTypeLabel, getWorkoutTypeLabel, getWorkoutTypeColor, cn } from "@/lib/utils";
import type { WorkoutType } from "@/types";

const WORKOUT_TYPES: { value: WorkoutType; label: string }[] = [
  { value: "push", label: "Push — Pecs / Épaules / Triceps" },
  { value: "pull", label: "Pull — Dos / Biceps" },
  { value: "legs", label: "Legs — Quadriceps / Ischios" },
  { value: "upper", label: "Upper Body" },
  { value: "lower", label: "Lower Body" },
  { value: "full", label: "Full Body" },
  { value: "cardio", label: "Cardio" },
];

interface ExoForm {
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

const EMPTY_EXO: ExoForm = { name: "", sets: "4", reps: "8", weight: "0" };

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, isMock, addWorkout, removeWorkout, addExercise, removeExercise } = useLocalPrograms();

  const program = getById(id);
  const readonly = isMock(id);

  // Session add state
  const [addingSession, setAddingSession] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionType, setSessionType] = useState<WorkoutType>("push");

  // Exercise add state per workout
  const [addingExoFor, setAddingExoFor] = useState<string | null>(null);
  const [exoForm, setExoForm] = useState<ExoForm>(EMPTY_EXO);

  // Collapsed state per workout
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  if (!program) {
    return (
      <div className="flex-1 px-4 py-10 text-center">
        <p className="text-muted-foreground">Programme introuvable.</p>
      </div>
    );
  }

  const workouts = program.workouts ?? [];

  function handleAddWorkout() {
    if (!sessionTitle.trim()) return;
    const title = sessionTitle.trim() || getWorkoutTypeLabel(sessionType);
    addWorkout(id, title, sessionType);
    setSessionTitle("");
    setAddingSession(false);
  }

  function handleAddExercise(workoutId: string) {
    const name = exoForm.name.trim();
    if (!name) return;
    const sets = parseInt(exoForm.sets) || 3;
    const reps = parseInt(exoForm.reps) || 8;
    const weight = parseFloat(exoForm.weight) || 0;
    addExercise(id, workoutId, name, sets, reps, weight);
    setExoForm(EMPTY_EXO);
    setAddingExoFor(null);
  }

  return (
    <div className="flex-1">
      <Header />

      <div className="px-4 lg:px-6 py-5 max-w-2xl space-y-5">

        {/* Back + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-secondary/70 transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs text-muted-foreground">{getProgramTypeLabel(program.type)}</span>
              {program.is_active && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Actif
                </span>
              )}
            </div>
            <h1 className="font-bold text-lg leading-tight truncate">{program.title}</h1>
          </div>
        </div>

        {/* Program meta */}
        <div className="bg-card border border-border rounded-2xl p-4 grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <p className="font-bold text-brand-700">{program.weekly_frequency}×</p>
            <p className="text-xs text-muted-foreground mt-0.5">par semaine</p>
          </div>
          <div>
            <p className="font-bold">
              {program.start_date ? format(parseISO(program.start_date), "d MMM", { locale: fr }) : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">début</p>
          </div>
          <div>
            <p className="font-bold">
              {program.end_date ? format(parseISO(program.end_date), "d MMM", { locale: fr }) : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">fin</p>
          </div>
        </div>

        {/* Sessions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Séances — {workouts.length}
            </p>
            {!readonly && (
              <button
                onClick={() => setAddingSession(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter une séance
              </button>
            )}
          </div>

          {/* Add session form */}
          <AnimatePresence>
            {addingSession && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-3"
              >
                <div className="bg-brand-50/60 border border-brand-200 rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-semibold">Nouvelle séance</p>
                  <input
                    value={sessionTitle}
                    onChange={e => setSessionTitle(e.target.value)}
                    placeholder="Nom de la séance (ex: Push A)"
                    autoFocus
                    className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/40 transition-all"
                  />
                  <select
                    value={sessionType}
                    onChange={e => setSessionType(e.target.value as WorkoutType)}
                    className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/40 transition-all"
                  >
                    {WORKOUT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAddingSession(false)}
                      className="flex-1 py-2 bg-white border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddWorkout}
                      className="flex-1 py-2 gradient-brand text-white rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Workout list */}
          <div className="space-y-3">
            {workouts.map((workout, wi) => {
              const exercises = workout.exercises ?? [];
              const isCollapsed = collapsed[workout.id];
              const isAddingExo = addingExoFor === workout.id;

              return (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: wi * 0.05 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                  {/* Workout header */}
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/60">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0", getWorkoutTypeColor(workout.workout_type))}>
                      {getWorkoutTypeLabel(workout.workout_type)}
                    </span>
                    <p className="font-semibold text-sm flex-1 min-w-0 truncate">{workout.title}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-muted-foreground tabular-nums">{exercises.length} exo</span>
                      <button
                        onClick={() => setCollapsed(prev => ({ ...prev, [workout.id]: !prev[workout.id] }))}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                      {!readonly && (
                        <button
                          onClick={() => removeWorkout(id, workout.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Exercises */}
                  {!isCollapsed && (
                    <>
                      {exercises.length === 0 && !isAddingExo && (
                        <div className="px-4 py-3 text-xs text-muted-foreground italic">
                          Aucun exercice — clique sur + pour en ajouter.
                        </div>
                      )}

                      {exercises.map((ex, ei) => (
                        <div key={ex.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0 group">
                          <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
                            {ei + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{ex.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ex.sets} × {ex.reps} reps{ex.weight > 0 ? ` · ${ex.weight} kg` : ""}
                            </p>
                          </div>
                          {!readonly && (
                            <button
                              onClick={() => removeExercise(id, workout.id, ex.id)}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Add exercise form */}
                      <AnimatePresence>
                        {isAddingExo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 py-3 bg-secondary/20 border-t border-border/40 space-y-2">
                              <input
                                value={exoForm.name}
                                onChange={e => setExoForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="Nom de l'exercice"
                                autoFocus
                                className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/40 transition-all"
                              />
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Séries</label>
                                  <input
                                    type="number"
                                    value={exoForm.sets}
                                    onChange={e => setExoForm(f => ({ ...f, sets: e.target.value }))}
                                    className="w-full px-2 py-1.5 bg-white border border-border rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-700/40 text-center"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Reps</label>
                                  <input
                                    type="number"
                                    value={exoForm.reps}
                                    onChange={e => setExoForm(f => ({ ...f, reps: e.target.value }))}
                                    className="w-full px-2 py-1.5 bg-white border border-border rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-700/40 text-center"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Poids kg</label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={exoForm.weight}
                                    onChange={e => setExoForm(f => ({ ...f, weight: e.target.value }))}
                                    className="w-full px-2 py-1.5 bg-white border border-border rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-700/40 text-center"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => { setAddingExoFor(null); setExoForm(EMPTY_EXO); }}
                                  className="flex-1 py-2 bg-white border border-border rounded-lg text-xs font-medium hover:bg-secondary transition-all"
                                >
                                  Annuler
                                </button>
                                <button
                                  onClick={() => handleAddExercise(workout.id)}
                                  className="flex-1 py-2 gradient-brand text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:opacity-90 active:scale-[0.98] transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Ajouter
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* "+ Exercice" button */}
                      {!readonly && !isAddingExo && (
                        <button
                          onClick={() => { setAddingExoFor(workout.id); setExoForm(EMPTY_EXO); }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-xs font-semibold text-brand-700 hover:bg-brand-50/50 transition-colors border-t border-border/30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Exercice
                        </button>
                      )}
                    </>
                  )}
                </motion.div>
              );
            })}

            {/* Empty state */}
            {workouts.length === 0 && !addingSession && (
              <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
                <p className="text-sm font-semibold mb-1">Aucune séance</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Ajoute tes séances (Push, Pull, Legs…) puis renseigne les exercices.
                </p>
                {!readonly && (
                  <button
                    onClick={() => setAddingSession(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 gradient-brand text-white text-sm font-semibold rounded-xl glow-brand-sm hover:opacity-90 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une séance
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom "+ Ajouter une séance" if workouts exist */}
          {!readonly && workouts.length > 0 && !addingSession && (
            <button
              onClick={() => setAddingSession(true)}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-card border border-dashed border-border rounded-2xl text-sm font-semibold text-muted-foreground hover:text-brand-700 hover:border-brand-200 hover:bg-brand-50/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              Ajouter une séance
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
