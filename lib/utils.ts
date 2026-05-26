import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, pattern = "dd MMM yyyy") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: fr });
}

export function formatRelativeDate(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: fr });
}

export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} kg`;
}

export function formatVolume(volume: number): string {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}t`;
  return `${volume} kg`;
}

export function getProgramTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    mass: "Prise de masse",
    cut: "Sèche",
    strength: "Force",
    maintenance: "Maintien",
    recomposition: "Recomposition",
  };
  return labels[type] ?? type;
}

export function getProgramTypeColor(type: string): string {
  const colors: Record<string, string> = {
    mass: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    cut: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    strength: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    maintenance: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    recomposition: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  };
  return colors[type] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20";
}

export function getWorkoutTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    push: "Push",
    pull: "Pull",
    legs: "Legs",
    upper: "Upper Body",
    lower: "Lower Body",
    full: "Full Body",
    cardio: "Cardio",
  };
  return labels[type] ?? type;
}

export function getWorkoutTypeColor(type: string): string {
  const colors: Record<string, string> = {
    push: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    pull: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    legs: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    upper: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    lower: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    full: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    cardio: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[type] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

export function getMuscleGroupLabel(group: string): string {
  const labels: Record<string, string> = {
    chest: "Pectoraux",
    back: "Dos",
    shoulders: "Épaules",
    biceps: "Biceps",
    triceps: "Triceps",
    forearms: "Avant-bras",
    quads: "Quadriceps",
    hamstrings: "Ischio-jambiers",
    glutes: "Fessiers",
    calves: "Mollets",
    abs: "Abdominaux",
    traps: "Trapèzes",
    lats: "Grand dorsal",
  };
  return labels[group] ?? group;
}

export function calculateWeightProgress(current: number, start: number, target: number): number {
  if (target === start) return 100;
  const progress = ((current - start) / (target - start)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
