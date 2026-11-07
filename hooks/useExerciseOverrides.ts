"use client";

import { useCallback, useEffect, useState } from "react";

export interface ExerciseOverride {
  weight: number;
  reps: number;
}

export const OVERRIDES_KEY = "pm_exercise_overrides";

/**
 * Charges/répétitions ajustées par l'utilisateur, par exercice.
 *
 * Ce hook existe parce que les surcharges n'étaient lues QUE dans /workouts :
 * la séance active repartait des valeurs d'origine du programme, et l'ajustement
 * était perdu au moment où il servait.
 */
export function useExerciseOverrides() {
  const [overrides, setOverrides] = useState<Record<string, ExerciseOverride>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function read() {
      try {
        const raw = localStorage.getItem(OVERRIDES_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        // Un objet est attendu ici : un tableau ou null casserait les accès par clé.
        setOverrides(parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {});
      } catch {
        setOverrides({});
      }
      setReady(true);
    }
    read();

    function onUpdated(e: Event) {
      if ((e as CustomEvent<string>).detail === OVERRIDES_KEY) read();
    }
    function onStorage(e: StorageEvent) {
      if (e.key === OVERRIDES_KEY) read();
    }
    window.addEventListener("pm-updated", onUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("pm-updated", onUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setOverride = useCallback((exerciseId: string, value: ExerciseOverride) => {
    setOverrides((prev) => {
      const next = { ...prev, [exerciseId]: value };
      try {
        localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent("pm-updated", { detail: OVERRIDES_KEY }));
      } catch {
        /* quota dépassé : l'état reste en mémoire pour la session */
      }
      return next;
    });
  }, []);

  return { overrides, ready, setOverride };
}
