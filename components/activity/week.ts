import { parseISO, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

/** Entrées dont created_at tombe dans la semaine courante (lundi → dimanche). */
export function filterThisWeek<T extends { created_at: string }>(logs: readonly T[]): T[] {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  return logs.filter((l) => isWithinInterval(parseISO(l.created_at), { start, end }));
}
