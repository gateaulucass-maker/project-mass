"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, Check, Pencil, Clock, ChevronRight,
  Dumbbell, Flame, Calendar,
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Header } from "@/components/layout/Header";
import { useLocalPrograms } from "@/hooks/useLocalPrograms";
import {
  getProgramTypeLabel, getProgramTypeColor,
  getWorkoutTypeLabel, getWorkoutTypeColor,
  getMuscleGroupLabel, cn,
} from "@/lib/utils";
import type { WorkoutType } from "@/types";

// ─── constantes ────────────────────────────────────────────────────────────────

const WORKOUT_TYPES: { value: WorkoutType; label: string }[] = [
  { value: "push",   label: "Push — Pecs / Épaules / Triceps" },
  { value: "pull",   label: "Pull — Dos / Biceps" },
  { value: "legs",   label: "Legs — Quadriceps / Ischios" },
  { value: "upper",  label: "Upper Body" },
  { value: "lower",  label: "Lower Body" },
  { value: "full",   label: "Full Body" },
  { value: "cardio", label: "Cardio" },
];

const MUSCLE_COLORS: Record<string, string> = {
  chest:      "bg-red-50 text-red-600 border-red-200",
  back:       "bg-blue-50 text-blue-600 border-blue-200",
  lats:       "bg-blue-50 text-blue-600 border-blue-200",
  shoulders:  "bg-purple-50 text-purple-600 border-purple-200",
  biceps:     "bg-amber-50 text-amber-600 border-amber-200",
  triceps:    "bg-orange-50 text-orange-600 border-orange-200",
  forearms:   "bg-yellow-50 text-yellow-600 border-yellow-200",
  quads:      "bg-emerald-50 text-emerald-600 border-emerald-200",
  hamstrings: "bg-teal-50 text-teal-600 border-teal-200",
  glutes:     "bg-pink-50 text-pink-600 border-pink-200",
  calves:     "bg-cyan-50 text-cyan-600 border-cyan-200",
  abs:        "bg-slate-50 text-slate-600 border-slate-200",
  traps:      "bg-indigo-50 text-indigo-600 border-indigo-200",
};

interface EditForm { sets: string; reps: string; weight: string; rest_time: string }
interface ExoForm  { name: string; sets: string; reps: string; weight: string }
const EMPTY_EXO: ExoForm = { name: "", sets: "4", reps: "8", weight: "0" };

// ─── composant ─────────────────────────────────────────────────────────────────

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, isMock, addWorkout, removeWorkout, addExercise, updateExercise, removeExercise } = useLocalPrograms();

  const program = getById(id);
  const readonly = isMock(id);

  const [activeTab, setActiveTab] = useState(0);

  // Add session
  const [addingSession, setAddingSession] = useState(false);
  const [sessionTitle, setSessionTitle]   = useState("");
  const [sessionType, setSessionType]     = useState<WorkoutType>("push");

  // Add exercise
  const [addingExoFor, setAddingExoFor] = useState<string | null>(null);
  const [exoForm, setExoForm]           = useState<ExoForm>(EMPTY_EXO);

  // Edit exercise
  const [editingExo, setEditingExo] = useState<string | null>(null);
  const [editForm, setEditForm]     = useState<EditForm>({ sets: "", reps: "", weight: "", rest_time: "" });

  if (!program) {
    return (
      <div className="flex-1 px-4 py-10 text-center">
        <p className="text-muted-foreground">Programme introuvable.</p>
      </div>
    );
  }

  const workouts = program.workouts ?? [];
  const currentTab = workouts[activeTab];
  const exercises  = currentTab?.exercises ?? [];

  const daysLeft = program.end_date
    ? differenceInDays(parseISO(program.end_date), new Date())
    : null;

  // ── handlers ────────────────────────────────────────────────────────────────

  function handleAddWorkout() {
    if (!sessionTitle.trim()) return;
    addWorkout(id, sessionTitle.trim(), sessionType);
    setSessionTitle("");
    setAddingSession(false);
    setActiveTab(workouts.length); // jump to new tab
  }

  function handleAddExercise(workoutId: string) {
    const name = exoForm.name.trim();
    if (!name) return;
    addExercise(id, workoutId, name, parseInt(exoForm.sets) || 3, parseInt(exoForm.reps) || 8, parseFloat(exoForm.weight) || 0);
    setExoForm(EMPTY_EXO);
    setAddingExoFor(null);
  }

  function openEdit(exId: string, sets: number, reps: number, weight: number, rest_time: number) {
    setEditingExo(exId);
    setEditForm({ sets: String(sets), reps: String(reps), weight: String(weight), rest_time: String(rest_time) });
  }

  function saveEdit(workoutId: string, exId: string) {
    updateExercise(id, workoutId, exId, {
      sets: parseInt(editForm.sets) || 1,
      reps: parseInt(editForm.reps) || 1,
      weight: parseFloat(editForm.weight) || 0,
      rest_time: parseInt(editForm.rest_time) || 60,
    });
    setEditingExo(null);
  }

  // ── render ──────────────────────────────────────────────────────────────────

  const inputClass = "w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-brand-700/30 transition-all";

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
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", getProgramTypeColor(program.type))}>
                {getProgramTypeLabel(program.type)}
              </span>
              {program.is_active && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Actif
                </span>
              )}
              {daysLeft !== null && daysLeft >= 0 && daysLeft <= 14 && (
                <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-500 border border-orange-200">
                  <Flame className="w-2.5 h-2.5" />
                  {daysLeft}j restants
                </span>
              )}
            </div>
            <h1 className="font-bold text-lg leading-tight truncate">{program.title}</h1>
          </div>
        </div>

        {/* Program meta card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {program.is_active && <div className="h-0.5 gradient-brand" />}
          <div className="p-4 grid grid-cols-3 gap-3 text-center text-sm">
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
                {program.end_date ? format(parseISO(program.end_date), "d MMM yy", { locale: fr }) : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">fin</p>
            </div>
          </div>
          {program.goal && (
            <div className="px-4 pb-4">
              <p className="text-xs text-muted-foreground italic border-t border-border pt-3">
                &ldquo;{program.goal}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Workouts section */}
        {workouts.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
              <Dumbbell className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="font-bold mb-1">Aucune séance</p>
            <p className="text-xs text-muted-foreground mb-5">
              Ajoute tes séances (Push, Pull, Legs…) puis renseigne les exercices.
            </p>
            {!readonly && (
              <button
                onClick={() => setAddingSession(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 gradient-brand text-white text-sm font-semibold rounded-xl glow-brand-sm hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" />
                Ajouter une séance
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tab bar */}
            <div className="flex gap-1 bg-secondary rounded-2xl p-1">
              {workouts.map((w, i) => (
                <button
                  key={w.id}
                  onClick={() => { setActiveTab(i); setAddingExoFor(null); setEditingExo(null); }}
                  className={cn(
                    "flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5",
                    activeTab === i
                      ? "bg-white shadow text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full border", getWorkoutTypeColor(w.workout_type))}>
                    {getWorkoutTypeLabel(w.workout_type)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{(w.exercises ?? []).length} exo</span>
                </button>
              ))}
              {!readonly && (
                <button
                  onClick={() => setAddingSession(true)}
                  className="w-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-brand-700 hover:bg-brand-50 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tab header */}
            {currentTab && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">{currentTab.title}</h2>
                  <p className="text-xs text-muted-foreground">{exercises.length} exercice{exercises.length > 1 ? "s" : ""}</p>
                </div>
                {!readonly && (
                  <button
                    onClick={() => removeWorkout(id, currentTab.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Exercise cards */}
            <div className="space-y-3">
              {exercises.length === 0 && !addingExoFor && (
                <div className="bg-secondary/30 border border-dashed border-border rounded-2xl px-5 py-8 text-center">
                  <p className="text-sm text-muted-foreground">Aucun exercice — clique sur&nbsp;
                    <span className="font-semibold text-brand-700">+ Exercice</span> pour en ajouter.
                  </p>
                </div>
              )}

              <AnimatePresence>
                {exercises.map((ex, ei) => {
                  const isEditing = editingExo === ex.id;
                  return (
                    <motion.div
                      key={ex.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "bg-card border rounded-2xl overflow-hidden transition-all",
                        isEditing ? "border-brand-700/30" : "border-border"
                      )}
                    >
                      <div className="p-4">
                        {/* Name + actions */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0 mt-0.5">
                              {ei + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm leading-snug">{ex.name}</p>
                              <span className={cn("inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full border mt-1", MUSCLE_COLORS[ex.muscle_group] ?? "bg-secondary text-muted-foreground border-border")}>
                                {getMuscleGroupLabel(ex.muscle_group)}
                              </span>
                            </div>
                          </div>
                          {!readonly && (
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => isEditing ? setEditingExo(null) : openEdit(ex.id, ex.sets, ex.reps, ex.weight, ex.rest_time)}
                                className={cn(
                                  "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                                  isEditing
                                    ? "bg-brand-50 text-brand-700"
                                    : "text-muted-foreground hover:text-brand-700 hover:bg-brand-50"
                                )}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => removeExercise(id, currentTab.id, ex.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Stats chips */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-secondary/60 rounded-xl py-2.5 text-center">
                            <p className="text-base font-bold leading-none">{ex.sets}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">séries</p>
                          </div>
                          <div className="bg-secondary/60 rounded-xl py-2.5 text-center">
                            <p className="text-base font-bold leading-none">{ex.reps}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">reps</p>
                          </div>
                          <div className={cn(
                            "rounded-xl py-2.5 text-center",
                            ex.weight > 0 ? "bg-brand-50" : "bg-secondary/60"
                          )}>
                            <p className={cn("text-base font-bold leading-none", ex.weight > 0 ? "text-brand-700" : "")}>
                              {ex.weight > 0 ? ex.weight : "—"}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">kg</p>
                          </div>
                        </div>

                        {/* Rest time */}
                        {ex.rest_time > 0 && (
                          <div className="flex items-center gap-1.5 mt-2.5">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{ex.rest_time}s de repos</span>
                          </div>
                        )}
                      </div>

                      {/* Inline edit panel */}
                      <AnimatePresence>
                        {isEditing && !readonly && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2 border-t border-border/60 space-y-3 bg-brand-50/30">
                              <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider">Modifier</p>
                              <div className="grid grid-cols-4 gap-2">
                                {([
                                  { key: "sets",      label: "Séries",  type: "number", step: "1"   },
                                  { key: "reps",      label: "Reps",    type: "number", step: "1"   },
                                  { key: "weight",    label: "Poids kg",type: "number", step: "2.5" },
                                  { key: "rest_time", label: "Repos s", type: "number", step: "15"  },
                                ] as const).map(field => (
                                  <div key={field.key}>
                                    <label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide block mb-1">
                                      {field.label}
                                    </label>
                                    <input
                                      type={field.type}
                                      step={field.step}
                                      value={editForm[field.key]}
                                      onChange={e => setEditForm(f => ({ ...f, [field.key]: e.target.value }))}
                                      className={inputClass}
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingExo(null)}
                                  className="flex-1 py-2 bg-white border border-border rounded-xl text-xs font-medium hover:bg-secondary transition-all"
                                >
                                  Annuler
                                </button>
                                <button
                                  onClick={() => saveEdit(currentTab.id, ex.id)}
                                  className="flex-1 py-2 gradient-brand text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 hover:opacity-90 transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Sauvegarder
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Add exercise form */}
              <AnimatePresence>
                {addingExoFor === currentTab?.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-brand-50/60 border border-brand-200 rounded-2xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-brand-700">Nouvel exercice</p>
                      <input
                        value={exoForm.name}
                        onChange={e => setExoForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Nom de l'exercice"
                        autoFocus
                        onKeyDown={e => e.key === "Enter" && handleAddExercise(currentTab.id)}
                        className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/40 transition-all"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { key: "sets",   label: "Séries"   },
                          { key: "reps",   label: "Reps"     },
                          { key: "weight", label: "Poids kg" },
                        ] as const).map(field => (
                          <div key={field.key}>
                            <label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide block mb-1">
                              {field.label}
                            </label>
                            <input
                              type="number"
                              step={field.key === "weight" ? "2.5" : "1"}
                              value={exoForm[field.key]}
                              onChange={e => setExoForm(f => ({ ...f, [field.key]: e.target.value }))}
                              className={inputClass}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setAddingExoFor(null); setExoForm(EMPTY_EXO); }}
                          className="flex-1 py-2 bg-white border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-all"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleAddExercise(currentTab.id)}
                          className="flex-1 py-2 gradient-brand text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1 hover:opacity-90 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* + Exercice button */}
              {!readonly && currentTab && addingExoFor !== currentTab.id && (
                <button
                  onClick={() => { setAddingExoFor(currentTab.id); setExoForm(EMPTY_EXO); setEditingExo(null); }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-card border border-dashed border-border rounded-2xl text-sm font-semibold text-muted-foreground hover:text-brand-700 hover:border-brand-200 hover:bg-brand-50/40 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Exercice
                </button>
              )}
            </div>
          </div>
        )}

        {/* Add session form */}
        <AnimatePresence>
          {addingSession && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-brand-50/60 border border-brand-200 rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold">Nouvelle séance</p>
                <input
                  value={sessionTitle}
                  onChange={e => setSessionTitle(e.target.value)}
                  placeholder="Nom (ex : Push A)"
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && handleAddWorkout()}
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
                    className="flex-1 py-2 gradient-brand text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                  >
                    Créer
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
