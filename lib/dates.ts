import { differenceInCalendarDays, format, parseISO } from "date-fns";

/**
 * Date du jour au format "yyyy-MM-dd", en heure LOCALE.
 *
 * `new Date().toISOString().split("T")[0]` renvoie la date UTC : à Bordeaux (UTC+2),
 * entre minuit et 02:00, elle donnait la veille. Un programme se terminant la veille
 * restait donc "actif", et la date de début pré-remplie était décalée d'un jour.
 */
export function todayLocal(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * Jours calendaires restants jusqu'à `isoDate` (négatif si la date est passée).
 *
 * `differenceInDays` compare des instants et tronque, donc "J-0" durait presque 24 h
 * et le basculement en "expiré" arrivait une demi-journée trop tard.
 */
export function daysUntil(isoDate: string): number {
  return differenceInCalendarDays(parseISO(isoDate), new Date());
}
