"use client";

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Minus, ChevronLeft, ChevronRight, Timer, Dumbbell, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getMuscleGroupLabel, cn } from "@/lib/utils";
import type { Workout } from "@/types";
import { useLocalPrograms } from "@/hooks/useLocalPrograms";
import { useExerciseOverrides } from "@/hooks/useExerciseOverrides";
import { completeSession, checkKeyFor, getSessionsStorageKey } from "@/lib/sessions";
import { getWeekStorageKey } from "@/hooks/useWorkoutChecks";

interface SetState {
  reps: number;
  weight: number;
  completed: boolean;
}

interface ExerciseState {
  sets: SetState[];
}

function ActiveWorkoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeProgram, custom, ready } = useLocalPrograms();
  const { overrides, ready: overridesReady } = useExerciseOverrides();
  const workoutId = searchParams.get("workout");

  // La séance provient des vrais programmes, plus de MOCK_WORKOUTS : sans cela un
  // programme personnalisé retombait silencieusement sur la séance "Push" de démo.
  // Même source que /workouts : le programme actif, puis les programmes personnalisés.
  // Les programmes de démonstration sont exclus, sinon un utilisateur sans programme
  // pouvait "terminer" une séance de démo et polluer ses statistiques.
  const workout = useMemo<Workout | null>(() => {
    const own = [
      ...(activeProgram?.workouts ?? []),
      ...custom.flatMap((p) => p.workouts ?? []),
    ];
    return own.find((w) => w.id === workoutId) ?? own[0] ?? null;
  }, [activeProgram, custom, workoutId]);

  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [exerciseStates, setExerciseStates] = useState<ExerciseState[]>([]);

  // Initialisation UNE SEULE FOIS par séance, repérée par son id.
  // Dépendre de l'objet `workout` relançait l'effet à chaque relecture du localStorage
  // (focus, retour d'onglet) : l'exercice courant revenait à 0 et les séries validées
  // étaient effacées en pleine séance.
  const initializedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!workout || !overridesReady || initializedFor.current === workout.id) return;
    initializedFor.current = workout.id;
    setCurrentExIdx(0);
    setExerciseStates(
      (workout.exercises ?? []).map((ex) => {
        // Les charges ajustées dans /workouts sont appliquées au démarrage.
        const ov = overrides[ex.id];
        const reps = ov?.reps ?? ex.reps;
        const weight = ov?.weight ?? ex.weight;
        return { sets: Array.from({ length: ex.sets }, () => ({ reps, weight, completed: false })) };
      })
    );
  }, [workout, overrides, overridesReady]);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);

  const exercises = workout?.exercises ?? [];
  const currentEx = exercises[currentExIdx];
  const currentState = exerciseStates[currentExIdx];

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Rest countdown
  useEffect(() => {
    if (restTimer === null || restTimer <= 0) return;
    const t = setTimeout(() => setRestTimer(r => (r ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [restTimer]);

  const updateSet = useCallback((setIdx: number, field: "reps" | "weight", delta: number) => {
    setExerciseStates(prev => {
      const next = [...prev];
      const sets = [...next[currentExIdx].sets];
      sets[setIdx] = { ...sets[setIdx], [field]: Math.max(1, sets[setIdx][field] + delta) };
      next[currentExIdx] = { sets };
      return next;
    });
  }, [currentExIdx]);

  const toggleSet = useCallback((setIdx: number) => {
    // L'updater doit rester pur : le timer de repos et le toast étaient déclenchés
    // dedans, donc joués deux fois en StrictMode.
    const wasCompleted = exerciseStates[currentExIdx]?.sets[setIdx]?.completed ?? false;

    setExerciseStates(prev => {
      const next = [...prev];
      const sets = [...next[currentExIdx].sets];
      sets[setIdx] = { ...sets[setIdx], completed: !sets[setIdx].completed };
      next[currentExIdx] = { sets };
      return next;
    });

    if (!wasCompleted && currentEx) {
      setRestTimer(currentEx.rest_time);
      toast.success(`Série ${setIdx + 1} validée ! Repos ${currentEx.rest_time}s`, { duration: 2000 });
    }
  }, [currentExIdx, currentEx, exerciseStates]);

  const allSetsCompleted = exerciseStates.every(es => es.sets.every(s => s.completed));
  const currentExCompleted = currentState?.sets.every(s => s.completed) ?? false;

  const completedSetsTotal = exerciseStates.reduce((acc, es) => acc + es.sets.filter(s => s.completed).length, 0);
  const totalSets = exerciseStates.reduce((acc, es) => acc + es.sets.length, 0);

  function formatElapsed(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function handleFinish() {
    if (!workout) return;

    // La séance était auparavant perdue : handleFinish ne faisait qu'un toast, donc
    // 24 séries validées laissaient l'accueil à 0 séance. On enregistre désormais la
    // séance terminée ET on coche ses exercices, pour que /workouts reste cohérent.
    const volume = exerciseStates.reduce(
      (acc, es) => acc + es.sets.filter((st) => st.completed).reduce((a, st) => a + st.reps * st.weight, 0),
      0
    );

    try {
      completeSession(0, {
        workout_id: workout.id,
        workout_title: workout.title,
        completed_at: new Date().toISOString(),
        sets_done: completedSetsTotal,
        volume_kg: volume,
      });

      const checksKey = getWeekStorageKey(0);
      const raw = localStorage.getItem(checksKey);
      const parsed = raw ? JSON.parse(raw) : null;
      const checks = new Set<string>(Array.isArray(parsed) ? (parsed as string[]) : []);
      for (const ex of workout.exercises ?? []) checks.add(checkKeyFor(workout.id, ex.id));
      localStorage.setItem(checksKey, JSON.stringify([...checks]));
      window.dispatchEvent(new CustomEvent("pm-updated", { detail: checksKey }));
    } catch {
      // Écriture impossible (quota, navigation privée) : on le dit au lieu de
      // afficher un succès mensonger.
      toast.error("Séance non enregistrée : stockage indisponible.");
      setFinished(true);
      return;
    }

    setFinished(true);
    toast.success("Séance terminée ! 💪");
  }

  // Tant que les programmes ne sont pas chargés, on n'affiche pas une séance vide.
  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="h-10 w-10 rounded-full border-2 border-border border-t-brand-700 animate-spin" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-7 h-7 text-muted-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold mb-2">Aucune séance à démarrer</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Ajoute des séances à ton programme pour lancer un entraînement.
          </p>
          <button
            onClick={() => router.push("/programs")}
            className="w-full py-3.5 gradient-brand text-white font-bold rounded-2xl"
          >
            Voir mes programmes
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-24 h-24 rounded-full gradient-brand flex items-center justify-center mx-auto mb-6 glow-violet">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-2">GG !</h1>
          <p className="text-muted-foreground mb-2">Séance terminée</p>
          <div className="flex justify-center gap-4 mb-8 text-sm">
            <div className="text-center">
              <p className="font-bold text-lg">{formatElapsed(elapsed)}</p>
              <p className="text-muted-foreground text-xs">Durée</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-bold text-lg">{completedSetsTotal}</p>
              <p className="text-muted-foreground text-xs">Séries</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-bold text-lg">{exercises.length}</p>
              <p className="text-muted-foreground text-xs">Exercices</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/workouts")}
            className="w-full py-4 gradient-brand text-white font-bold rounded-2xl glow-violet"
          >
            Retour aux séances
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">{workout?.title}</p>
            <p className="text-sm font-bold text-brand-700">{formatElapsed(elapsed)}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-medium">{completedSetsTotal}/{totalSets}</p>
              <p className="text-[10px] text-muted-foreground">séries</p>
            </div>
          </div>
        </div>

        {/* Global progress */}
        <div className="max-w-2xl mx-auto mt-2">
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${totalSets > 0 ? (completedSetsTotal / totalSets) * 100 : 0}%` }}
              transition={{ duration: 0.3 }}
              className="h-full gradient-brand rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Rest timer overlay */}
      <AnimatePresence>
        {restTimer !== null && restTimer > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setRestTimer(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="relative w-40 h-40 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-brand-700/20" />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-brand-700"
                  style={{ borderRightColor: "transparent", borderBottomColor: "transparent" }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-black text-brand-700">{restTimer}</span>
                </div>
              </div>
              <p className="text-white/70 text-lg font-semibold">Repos</p>
              <p className="text-white/40 text-sm mt-1">Touche pour ignorer</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {/* Exercise nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentExIdx(Math.max(0, currentExIdx - 1))}
            disabled={currentExIdx === 0}
            className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-1.5">
            {exercises.map((_, i) => {
              const done = exerciseStates[i]?.sets.every(s => s.completed);
              return (
                <button
                  key={i}
                  onClick={() => setCurrentExIdx(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === currentExIdx ? "w-6 bg-brand-700" : done ? "bg-emerald-500/60" : "bg-secondary"
                  )}
                />
              );
            })}
          </div>

          <button
            onClick={() => setCurrentExIdx(Math.min(exercises.length - 1, currentExIdx + 1))}
            disabled={currentExIdx === exercises.length - 1}
            className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Current Exercise.
            mode="wait" a été retiré : avec framer-motion 11 + React 19, le bloc sortant
            ne terminait jamais sa sortie, donc l'exercice suivant ne s'affichait pas
            (l'état changeait pourtant bien). */}
        {currentEx && currentState && (
          <motion.div
            key={currentExIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
              {/* Exercise header */}
              <div className="bg-card border border-border rounded-2xl p-5 mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Exercice {currentExIdx + 1}/{exercises.length}
                    </p>
                    <h2 className="text-xl font-black">{currentEx.name}</h2>
                    <p className="text-sm text-brand-700 mt-0.5">{getMuscleGroupLabel(currentEx.muscle_group)}</p>
                  </div>
                  {currentExCompleted && (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" />
                    Repos: {currentEx.rest_time}s
                  </span>
                  <span>{currentEx.sets} séries × {currentEx.reps} reps</span>
                </div>
              </div>

              {/* Sets */}
              <div className="space-y-3 mb-5">
                {currentState.sets.map((set, si) => (
                  <motion.div
                    key={si}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: si * 0.04 }}
                    className={cn(
                      "bg-card border rounded-2xl p-4 transition-all",
                      set.completed ? "border-emerald-500/30 bg-emerald-500/5" : "border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Set number */}
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
                        set.completed ? "bg-emerald-500/20 text-emerald-400" : "bg-secondary text-muted-foreground"
                      )}>
                        {si + 1}
                      </div>

                      {/* Weight control */}
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1.5">Charge (kg)</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateSet(si, "weight", -2.5)}
                            className="w-9 h-9 rounded-xl bg-secondary/60 border border-border flex items-center justify-center active:scale-95 transition-all"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex-1 text-center">
                            <span className="text-xl font-black">{set.weight}</span>
                            <span className="text-sm text-muted-foreground ml-1">kg</span>
                          </div>
                          <button
                            onClick={() => updateSet(si, "weight", 2.5)}
                            className="w-9 h-9 rounded-xl bg-secondary/60 border border-border flex items-center justify-center active:scale-95 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Reps control */}
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1.5">Reps</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateSet(si, "reps", -1)}
                            className="w-9 h-9 rounded-xl bg-secondary/60 border border-border flex items-center justify-center active:scale-95 transition-all"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex-1 text-center">
                            <span className="text-xl font-black">{set.reps}</span>
                          </div>
                          <button
                            onClick={() => updateSet(si, "reps", 1)}
                            className="w-9 h-9 rounded-xl bg-secondary/60 border border-border flex items-center justify-center active:scale-95 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Complete button */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleSet(si)}
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                          set.completed
                            ? "bg-emerald-500/20 border border-emerald-500/30"
                            : "gradient-brand glow-brand-sm"
                        )}
                      >
                        {set.completed ? (
                          <Check className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Check className="w-5 h-5 text-white" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Next exercise preview */}
              {currentExIdx < exercises.length - 1 && (
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/30 mb-4">
                  <Dumbbell className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Prochain exercice</p>
                    <p className="text-sm font-medium truncate">{exercises[currentExIdx + 1].name}</p>
                  </div>
                  <button
                    onClick={() => setCurrentExIdx(currentExIdx + 1)}
                    className="text-xs text-brand-700 hover:text-brand-400 flex items-center gap-1 flex-shrink-0"
                  >
                    Suivant <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
          </motion.div>
        )}

        {/* Finish button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleFinish}
          className={cn(
            "w-full py-4 font-bold text-base rounded-2xl flex items-center justify-center gap-3 transition-all",
            allSetsCompleted
              ? "gradient-brand text-white glow-violet"
              : "bg-secondary border border-border text-muted-foreground"
          )}
        >
          <CheckCircle2 className="w-5 h-5" />
          {allSetsCompleted ? "Terminer la séance 🎉" : `Terminer (${completedSetsTotal}/${totalSets} séries)`}
        </motion.button>
      </div>
    </div>
  );
}

export default function ActiveWorkoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-brand-700 border-t-transparent animate-spin" /></div>}>
      <ActiveWorkoutContent />
    </Suspense>
  );
}
