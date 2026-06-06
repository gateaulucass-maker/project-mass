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
    // 1. Programme custom explicitement activé → priorité absolue
    const explicitCustom = custom.find(p => p.is_active);
    if (explicitCustom) return explicitCustom;

    // 2. Si l'utilisateur a des programmes custom, prendre le plus récent automatiquement
    //    (évite que PPL expiré reste affiché quand Summer Body existe)
    if (custom.length > 0) {
      const todayStr = new Date().toISOString().split("T")[0];
      const covering = custom.filter(p => {
        const started = p.start_date <= todayStr;
        const ongoing = !p.end_date || p.end_date >= todayStr;
        return started && ongoing;
      });
      if (covering.length > 0) {
        return [...covering].sort((a, b) => b.start_date.localeCompare(a.start_date))[0];
      }
      // Aucun custom ne couvre aujourd'hui → le plus récent quand même
      return [...custom].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    }

    // 3. Fallback mocks — programmes dont la date couvre aujourd'hui
    const todayStr = new Date().toISOString().split("T")[0];
    const covering = allPrograms.filter(p => {
      const started = p.start_date <= todayStr;
      const ongoing = !p.end_date || p.end_date >= todayStr;
      return started && ongoing;
    });
    if (covering.length > 0) {
      return covering.find(p => p.is_active) ??
        [...covering].sort((a, b) => b.start_date.localeCompare(a.start_date))[0];
    }
    return allPrograms.find(p => p.is_active) ?? allPrograms[0];
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
    const next = custom.map(p => ({ ...p, is_active: p.id === id }));
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
    addWorkout,
    removeWorkout,
    addExercise,
    updateExercise,
    removeExercise,
  };
}
