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
    setCustom(loadCustom());
    setReady(true);
  }, []);

  // Stable reference — évite de recalculer activeProgram à chaque render
  const allPrograms = useMemo(
    () => [...MOCK_PROGRAMS, ...custom] as Program[],
    [custom],
  );

  // Programme actif calculé par la date : si un programme couvre aujourd'hui, il prime sur is_active
  const activeProgram = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const covering = allPrograms.filter(p => {
      const started = p.start_date <= todayStr;
      const ongoing = !p.end_date || p.end_date >= todayStr;
      return started && ongoing;
    });
    if (covering.length > 0) {
      return (
        covering.find(p => p.is_active) ??
        [...covering].sort((a, b) => b.start_date.localeCompare(a.start_date))[0]
      );
    }
    return allPrograms.find(p => p.is_active) ?? allPrograms[0];
  }, [allPrograms]);

  function getById(id: string): Program | undefined {
    return allPrograms.find(p => p.id === id);
  }

  function addProgram(data: Omit<Program, "id" | "user_id" | "created_at">): Program {
    const p: Program = {
      ...data,
      id: `p_${Date.now()}`,
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
      id: `w_${Date.now()}`,
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
      id: `e_${Date.now()}`,
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

  return {
    allPrograms,
    activeProgram,
    custom,
    ready,
    getById,
    isMock,
    addProgram,
    removeProgram,
    addWorkout,
    removeWorkout,
    addExercise,
    updateExercise,
    removeExercise,
  };
}
