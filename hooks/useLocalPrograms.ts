"use client";

import { useState, useEffect, useMemo } from "react";
import type { Program, Workout, Exercise, WorkoutType, MuscleGroup } from "@/types";
import { MOCK_PROGRAMS } from "@/lib/mock-data";

const KEY = "pm_programs_v2";

function loadCustom(): Program[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Program[]) : [];
  } catch { return []; }
}

function saveCustom(programs: Program[]) {
  try { localStorage.setItem(KEY, JSON.stringify(programs)); } catch {}
}

export function useLocalPrograms() {
  const [custom, setCustom] = useState<Program[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function load() {
      setCustom(loadCustom());
      setReady(true);
    }
    load();
    function onStorage(e: StorageEvent) {
      if (e.key === KEY) load();
    }
    function onVisible() {
      if (document.visibilityState === "visible") load();
    }
    function onFocus() { load(); }
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) load();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow as EventListener);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow as EventListener);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Stable reference — évite de recalculer activeProgram à chaque render
  const allPrograms = useMemo(
    () => [...MOCK_PROGRAMS, ...custom] as Program[],
    [custom],
  );

  const activeProgram = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const isCovering = (p: Program) => {
      const started = p.start_date <= todayStr;
      const ongoing = !p.end_date || p.end_date >= todayStr;
      return started && ongoing;
    };

    // 1. Programme custom explicitement activé et pas terminé → priorité absolue
    const explicitCustom = custom.find(p => p.is_active && !p.completed);
    if (explicitCustom) return explicitCustom;

    // 2. Si l'utilisateur a des programmes custom, prendre le plus récent en cours.
    //    Un programme terminé (objectif atteint ou date dépassée) ou expiré ne compte
    //    plus jamais comme actif — sinon on reste bloqué dessus indéfiniment.
    if (custom.length > 0) {
      const covering = custom.filter(p => !p.completed && isCovering(p));
      if (covering.length > 0) {
        return [...covering].sort((a, b) => b.start_date.localeCompare(a.start_date))[0];
      }
      // Aucun custom en cours → pas de fallback : l'utilisateur doit relancer un programme
      return undefined;
    }

    // 3. Fallback mocks — uniquement les programmes dont la période couvre aujourd'hui
    const covering = allPrograms.filter(isCovering);
    if (covering.length > 0) {
      return covering.find(p => p.is_active) ??
        [...covering].sort((a, b) => b.start_date.localeCompare(a.start_date))[0];
    }
    return undefined;
  }, [allPrograms, custom]);

  function getById(id: string): Program | undefined {
    return allPrograms.find(p => p.id === id);
  }

  function addProgram(data: Omit<Program, "id" | "user_id" | "created_at">): Program {
    const p: Program = {
      ...data,
      id: `p${Date.now()}`,
      user_id: "local",
      created_at: new Date().toISOString(),
      workouts: [],
    };
    const next = [...custom, p];
    setCustom(next);
    saveCustom(next);
    return p;
  }

  function removeProgram(id: string) {
    const next = custom.filter(p => p.id !== id);
    setCustom(next);
    saveCustom(next);
  }

  function addWorkout(programId: string, title: string, workout_type: WorkoutType): Workout | null {
    const w: Workout = {
      id: `w${Date.now()}`,
      program_id: programId,
      title,
      workout_type,
      created_at: new Date().toISOString(),
      exercises: [],
    };
    const next = custom.map(p => p.id !== programId ? p : {
      ...p,
      workouts: [...(p.workouts ?? []), w],
    });
    setCustom(next);
    saveCustom(next);
    return w;
  }

  function removeWorkout(programId: string, workoutId: string) {
    const next = custom.map(p => p.id !== programId ? p : {
      ...p,
      workouts: (p.workouts ?? []).filter(w => w.id !== workoutId),
    });
    setCustom(next);
    saveCustom(next);
  }

  function addExercise(
    programId: string,
    workoutId: string,
    name: string,
    sets: number,
    reps: number,
    weight: number,
    muscle_group: MuscleGroup = "chest",
  ) {
    const ex: Exercise = {
      id: `e${Date.now()}`,
      workout_id: workoutId,
      name,
      muscle_group,
      sets,
      reps,
      weight,
      rest_time: 90,
      order_index: 0,
    };
    const next = custom.map(p => p.id !== programId ? p : {
      ...p,
      workouts: (p.workouts ?? []).map(w => w.id !== workoutId ? w : {
        ...w,
        exercises: [...(w.exercises ?? []), ex],
      }),
    });
    setCustom(next);
    saveCustom(next);
  }

  function updateExercise(
    programId: string,
    workoutId: string,
    exerciseId: string,
    updates: Partial<Pick<Exercise, "sets" | "reps" | "weight" | "rest_time">>,
  ) {
    const next = custom.map(p => p.id !== programId ? p : {
      ...p,
      workouts: (p.workouts ?? []).map(w => w.id !== workoutId ? w : {
        ...w,
        exercises: (w.exercises ?? []).map(e => e.id !== exerciseId ? e : { ...e, ...updates }),
      }),
    });
    setCustom(next);
    saveCustom(next);
  }

  function removeExercise(programId: string, workoutId: string, exerciseId: string) {
    const next = custom.map(p => p.id !== programId ? p : {
      ...p,
      workouts: (p.workouts ?? []).map(w => w.id !== workoutId ? w : {
        ...w,
        exercises: (w.exercises ?? []).filter(e => e.id !== exerciseId),
      }),
    });
    setCustom(next);
    saveCustom(next);
  }

  const isMock = (id: string) => MOCK_PROGRAMS.some(p => p.id === id);

  function activateProgram(id: string) {
    if (isMock(id)) return; // les mocks ont is_active hardcodé, on ne peut pas les modifier
    // Réactiver explicitement un programme lève aussi son statut "terminé" —
    // sinon il resterait invisible pour la sélection du programme actif malgré is_active:true.
    const next = custom.map(p => ({
      ...p,
      is_active: p.id === id,
      completed: p.id === id ? false : p.completed,
      completed_at: p.id === id ? undefined : p.completed_at,
    }));
    setCustom(next);
    saveCustom(next);
  }

  // Marque un programme custom comme terminé (objectif atteint ou date dépassée) :
  // il ne sera plus jamais resélectionné comme actif, même si ses dates le couvrent encore.
  function completeProgram(id: string) {
    if (isMock(id)) return;
    const next = custom.map(p => p.id !== id ? p : {
      ...p,
      is_active: false,
      completed: true,
      completed_at: new Date().toISOString(),
    });
    setCustom(next);
    saveCustom(next);
  }

  return {
    allPrograms,
    activeProgram,
    custom,
    ready,
    getById,
    isMock,
    addProgram,
    removeProgram,
    activateProgram,
    completeProgram,
    addWorkout,
    removeWorkout,
    addExercise,
    updateExercise,
    removeExercise,
  };
}
