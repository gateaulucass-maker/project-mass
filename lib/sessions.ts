import { addWeeks, getISOWeek, getISOWeekYear } from "date-fns";
import type { Workout } from "@/types";

/**
 * Source de vérité unique du comptage des séances.
 *
 * Deux jeux de clés cohabitent dans localStorage :
 *  - `pm_checks_<annéeISO>_w<NN>`   : cases cochées, une par exercice ("<workoutId>_e<exerciseId>").
 *  - `pm_sessions_<annéeISO>_w<NN>` : séances réellement TERMINÉES (ce module).
 *
 * Avant, une séance était comptée dès qu'UN seul exercice était coché : cocher 1 des
 * 6 exercices de Push affichait "1 séance faite". Désormais une séance ne compte que
 * lorsqu'elle est terminée — soit tous ses exercices cochés, soit validée en séance active.
 */

export interface CompletedSession {
  workout_id: string;
  workout_title: string;
  completed_at: string;
  /** Nombre de séries validées, quand l'info est disponible (séance active). */
  sets_done?: number;
  /** Tonnage de la séance en kg, quand l'info est disponible (séance active). */
  volume_kg?: number;
}

export const SESSIONS_KEY_PREFIX = "pm_sessions_";
export const CHECKS_KEY_PREFIX = "pm_checks_";

function weekSuffix(weekOffset: number): string {
  const d = addWeeks(new Date(), weekOffset);
  return `${getISOWeekYear(d)}_w${String(getISOWeek(d)).padStart(2, "0")}`;
}

export function getSessionsStorageKey(weekOffset: number): string {
  return `${SESSIONS_KEY_PREFIX}${weekSuffix(weekOffset)}`;
}

/**
 * Extrait l'id de séance depuis une clé de check "<workoutId>_e<exerciseId>".
 * `lastIndexOf` et non `split("_e")` : un id de séance contenant "_e" cassait le découpage
 * ("w_extra_e3".split("_e")[0] donnait "w").
 */
export function workoutIdFromCheckKey(checkKey: string): string {
  const i = checkKey.lastIndexOf("_e");
  return i > 0 ? checkKey.slice(0, i) : checkKey;
}

/**
 * Clé de check telle que l'écrit /workouts : "<workoutId>_<exerciseId>".
 * Les ids d'exercices commencent déjà par "e" ("e1", "e1748…"), d'où la forme "w1_e1"
 * et la fiabilité de "_e" comme séparateur en lecture.
 */
export function checkKeyFor(workoutId: string, exerciseId: string): string {
  return `${workoutId}_${exerciseId}`;
}

function readArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** Cases cochées d'une semaine ISO, sous forme d'ensemble. */
export function readWeekChecks(weekOffset: number): Set<string> {
  return new Set(readArray<string>(`${CHECKS_KEY_PREFIX}${weekSuffix(weekOffset)}`));
}

export function readCompletedSessions(weekOffset: number): CompletedSession[] {
  return readArray<CompletedSession>(getSessionsStorageKey(weekOffset));
}

/** Notifie les composants du même onglet (les hooks écoutent déjà "pm-updated"). */
function notify(key: string): void {
  window.dispatchEvent(new CustomEvent("pm-updated", { detail: key }));
}

/** Enregistre une séance terminée. Idempotent : une même séance ne compte qu'une fois par semaine. */
export function completeSession(weekOffset: number, session: CompletedSession): void {
  const key = getSessionsStorageKey(weekOffset);
  const current = readArray<CompletedSession>(key);
  const next = [...current.filter((s) => s.workout_id !== session.workout_id), session];
  try {
    localStorage.setItem(key, JSON.stringify(next));
    notify(key);
  } catch {
    // Quota dépassé ou stockage refusé : l'appelant décide quoi afficher.
    throw new Error("storage-write-failed");
  }
}

/** Retire une séance terminée (l'utilisateur décoche un exercice d'une séance complète). */
export function uncompleteSession(weekOffset: number, workoutId: string): void {
  const key = getSessionsStorageKey(weekOffset);
  const current = readArray<CompletedSession>(key);
  if (!current.some((s) => s.workout_id === workoutId)) return;
  try {
    localStorage.setItem(key, JSON.stringify(current.filter((s) => s.workout_id !== workoutId)));
    notify(key);
  } catch {
    /* lecture seule : on laisse l'état tel quel */
  }
}

/** Vrai si tous les exercices de la séance sont cochés (et qu'elle en a au moins un). */
export function isWorkoutFullyChecked(checked: Set<string>, workout: Workout): boolean {
  const exercises = workout.exercises ?? [];
  if (exercises.length === 0) return false;
  return exercises.every((ex) => checked.has(checkKeyFor(workout.id, ex.id)));
}

export const SESSIONS_EPOCH_KEY = "pm_sessions_epoch";

/**
 * Semaine à partir de laquelle le comptage exact s'applique.
 *
 * Sans cette borne, le repli historique s'appliquait AUSSI à la semaine en cours :
 * cocher 1 exercice sur 3 continuait d'afficher "1 séance". La borne est posée au
 * premier chargement du nouveau code : les semaines antérieures gardent leur
 * historique (ancienne règle), les suivantes exigent une séance réellement terminée.
 */
function getEpoch(): string {
  try {
    const stored = localStorage.getItem(SESSIONS_EPOCH_KEY);
    if (stored) return stored;
    const now = weekSuffix(0);
    localStorage.setItem(SESSIONS_EPOCH_KEY, now);
    return now;
  } catch {
    return weekSuffix(0);
  }
}

/** Nombre de séances d'une semaine (exact depuis la borne, historique avant). */
export function countSessionsForWeek(weekOffset: number): number {
  const suffix = weekSuffix(weekOffset);
  const sessions = readArray<CompletedSession>(`${SESSIONS_KEY_PREFIX}${suffix}`);
  // Le format "YYYY_wNN" est zéro-padé : la comparaison lexicographique est chronologique.
  if (suffix >= getEpoch()) return sessions.length;
  if (sessions.length > 0) return sessions.length;

  const legacy = readArray<string>(`${CHECKS_KEY_PREFIX}${suffix}`);
  if (legacy.length === 0) return 0;
  return new Set(legacy.map(workoutIdFromCheckKey)).size;
}

/** Total toutes semaines confondues, en balayant les clés présentes une seule fois. */
export function countAllSessions(): number {
  let total = 0;
  const legacyWeeks: string[] = [];
  const sessionWeeks = new Set<string>();

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.startsWith(SESSIONS_KEY_PREFIX)) {
      sessionWeeks.add(k.slice(SESSIONS_KEY_PREFIX.length));
      total += readArray<CompletedSession>(k).length;
    } else if (k.startsWith(CHECKS_KEY_PREFIX)) {
      legacyWeeks.push(k);
    }
  }

  // Repli uniquement pour les semaines ANTÉRIEURES à la borne et sans séance enregistrée.
  const epoch = getEpoch();
  for (const k of legacyWeeks) {
    const suffix = k.slice(CHECKS_KEY_PREFIX.length);
    if (suffix >= epoch) continue;
    if (sessionWeeks.has(suffix)) continue;
    total += new Set(readArray<string>(k).map(workoutIdFromCheckKey)).size;
  }
  return total;
}

/** Nombre de semaines consécutives avec au moins une séance, en remontant depuis cette semaine. */
export function countWeeklyStreak(maxWeeks = 52): number {
  let streak = 0;
  for (let offset = 0; offset >= -maxWeeks; offset--) {
    if (countSessionsForWeek(offset) > 0) streak++;
    else if (offset < 0) break;
  }
  return streak;
}
