"use client";

import { motion } from "framer-motion";
import { Calendar, MoreHorizontal, CheckCircle2, Trash2, Play, Edit2, Dumbbell, Flame, Clock } from "lucide-react";
import { format, parseISO, differenceInWeeks, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import type { Program } from "@/types";
import { getProgramTypeColor, getProgramTypeLabel, calculateWeightProgress, cn } from "@/lib/utils";

interface ProgramCardProps {
  program: Program;
  index: number;
  currentWeight?: number;
  onActivate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ProgramCard({ program, index, currentWeight, onActivate, onDelete }: ProgramCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const isUpcoming = program.start_date > todayStr;
  const isExpired  = !!program.end_date && program.end_date < todayStr;

  const daysLeft = program.end_date
    ? differenceInDays(parseISO(program.end_date), new Date())
    : null;
  const daysUntilStart = isUpcoming
    ? differenceInDays(parseISO(program.start_date), new Date())
    : null;

  const durationWeeks = program.end_date
    ? differenceInWeeks(parseISO(program.end_date), parseISO(program.start_date))
    : null;

  const hasWeightGoal =
    !!program.start_weight &&
    !!program.target_weight &&
    program.start_weight !== program.target_weight;

  const progress = hasWeightGoal
    ? calculateWeightProgress(
        currentWeight ?? program.target_weight!,
        program.start_weight!,
        program.target_weight!
      )
    : 0;

  const workoutCount = program.workouts?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={cn(
        "bg-card border rounded-2xl overflow-hidden transition-all",
        program.is_active
          ? "border-brand-700/30 shadow-[0_0_24px_rgba(185,28,28,0.08)]"
          : "border-border"
      )}
    >
      {program.is_active && <div className="h-1 gradient-brand w-full" />}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", getProgramTypeColor(program.type))}>
                {getProgramTypeLabel(program.type)}
              </span>
              {program.is_active && (
                <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Actif
                </span>
              )}
              {!program.is_active && isUpcoming && (
                <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  <Clock className="w-3 h-3" />
                  À venir
                </span>
              )}
              {!program.is_active && !isUpcoming && (
                <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                  <CheckCircle2 className="w-3 h-3" />
                  Terminé
                </span>
              )}
            </div>
            <h3 className="font-bold text-base leading-tight">{program.title}</h3>
          </div>

          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/70 transition-all"
            >
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); }} />
                <div className="absolute right-0 top-10 w-44 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                  {!program.is_active && (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onActivate?.(program.id); setMenuOpen(false); toast.success("Programme activé"); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-secondary transition-colors text-left"
                    >
                      <Play className="w-3.5 h-3.5 text-brand-700" />
                      Activer
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-secondary transition-colors text-left"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    Modifier
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(program.id); setMenuOpen(false); toast.success("Programme supprimé"); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-destructive/10 text-destructive transition-colors text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Date + meta */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 flex-wrap">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {format(parseISO(program.start_date), "d MMM", { locale: fr })}
            {program.end_date
              ? ` → ${format(parseISO(program.end_date), "d MMM yyyy", { locale: fr })}`
              : ""}
          </span>
          {durationWeeks !== null && (
            <>
              <span className="text-border/80">·</span>
              <span>{durationWeeks} sem.</span>
            </>
          )}
          {workoutCount > 0 && (
            <>
              <span className="text-border/80">·</span>
              <span className="flex items-center gap-1">
                <Dumbbell className="w-3 h-3" />
                {workoutCount} séances
              </span>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-secondary/50 rounded-xl p-2.5 text-center">
            <p className="font-bold text-sm">{program.weekly_frequency}×</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">par semaine</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-2.5 text-center">
            <p className="font-bold text-sm">{program.calories_target ?? "—"}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">calories/j</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-2.5 text-center">
            <p className="font-bold text-sm">{program.target_weight ? `${program.target_weight} kg` : "—"}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">objectif</p>
          </div>
        </div>

        {/* Weight progress */}
        {hasWeightGoal && (
          <div className="mb-4">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-muted-foreground">{program.start_weight} kg</span>
              <span className={cn("font-semibold", progress >= 100 ? "text-emerald-600" : "text-brand-700")}>
                {Math.round(progress)}%
              </span>
              <span className="text-muted-foreground">{program.target_weight} kg</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: index * 0.07 + 0.3, duration: 0.8, ease: "easeOut" }}
                className={cn("h-full rounded-full", progress >= 100 ? "bg-emerald-500" : "gradient-brand")}
              />
            </div>
          </div>
        )}

        {/* Goal text */}
        {program.goal && (
          <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2">
            &ldquo;{program.goal}&rdquo;
          </p>
        )}

        {/* Days left (active) / days until start (upcoming) */}
        {program.is_active && daysLeft !== null && daysLeft > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className={cn("text-xs font-medium", daysLeft < 14 ? "text-orange-400" : "text-muted-foreground")}>
              {daysLeft} jours restants
            </span>
          </div>
        )}
        {isUpcoming && daysUntilStart !== null && (
          <div className="flex items-center gap-1.5 mt-3">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-medium text-blue-500">
              Démarre dans {daysUntilStart} jour{daysUntilStart > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
