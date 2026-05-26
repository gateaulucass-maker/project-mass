"use client";

import { motion } from "framer-motion";
import { Calendar, Target, Zap, MoreHorizontal, CheckCircle2, Edit2, Trash2, Play } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import type { Program } from "@/types";
import { getProgramTypeColor, getProgramTypeLabel, cn } from "@/lib/utils";

interface ProgramCardProps {
  program: Program;
  index: number;
  onActivate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ProgramCard({ program, index, onActivate, onDelete }: ProgramCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const daysLeft = program.end_date
    ? differenceInDays(parseISO(program.end_date), new Date())
    : null;

  const progress = program.start_weight && program.target_weight && program.start_weight !== program.target_weight
    ? Math.min(Math.max(((81.5 - program.start_weight) / (program.target_weight - program.start_weight)) * 100, 0), 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={cn(
        "bg-card border rounded-2xl p-5 relative overflow-hidden transition-all",
        program.is_active
          ? "border-brand-700/30 shadow-violet-sm"
          : "border-border hover:border-border"
      )}
    >
      {program.is_active && (
        <div className="absolute inset-0 bg-brand-700/5 pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", getProgramTypeColor(program.type))}>
              {getProgramTypeLabel(program.type)}
            </span>
            {program.is_active && (
              <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Actif
              </span>
            )}
          </div>
          <h3 className="font-bold text-base leading-tight truncate">{program.title}</h3>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-xl bg-secondary hover:bg-secondary flex items-center justify-center transition-all"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-40 bg-card border border-border rounded-xl shadow-card-dark overflow-hidden z-50">
              {!program.is_active && (
                <button
                  onClick={() => { onActivate?.(program.id); setMenuOpen(false); toast.success("Programme activé"); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-secondary transition-colors text-left"
                >
                  <Play className="w-3.5 h-3.5 text-brand-700" />
                  Activer
                </button>
              )}
              <button
                onClick={() => { setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-secondary transition-colors text-left"
              >
                <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                Modifier
              </button>
              <button
                onClick={() => { onDelete?.(program.id); setMenuOpen(false); toast.success("Programme supprimé"); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-destructive/10 text-destructive transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
        <div className="bg-secondary/40 rounded-xl p-2.5">
          <p className="text-xs text-muted-foreground mb-0.5">Fréquence</p>
          <p className="font-bold text-sm">{program.weekly_frequency}×/sem</p>
        </div>
        <div className="bg-secondary/40 rounded-xl p-2.5">
          <p className="text-xs text-muted-foreground mb-0.5">Calories</p>
          <p className="font-bold text-sm">{program.calories_target ?? "—"}</p>
        </div>
        <div className="bg-secondary/40 rounded-xl p-2.5">
          <p className="text-xs text-muted-foreground mb-0.5">Poids cible</p>
          <p className="font-bold text-sm">{program.target_weight ?? "—"} kg</p>
        </div>
      </div>

      {/* Progress (active only) */}
      {program.is_active && program.start_weight && program.target_weight && (
        <div className="mb-4 relative z-10">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">{program.start_weight} kg</span>
            <span className="text-brand-700 font-medium">{Math.round(progress)}%</span>
            <span className="text-muted-foreground">{program.target_weight} kg</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="h-full gradient-brand rounded-full"
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground relative z-10">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {format(parseISO(program.start_date), "dd MMM yyyy", { locale: fr })}
        </div>
        {daysLeft !== null && daysLeft > 0 && (
          <span className={cn(
            "px-2 py-0.5 rounded-full",
            daysLeft < 14 ? "bg-orange-500/15 text-orange-400" : "bg-secondary text-muted-foreground"
          )}>
            {daysLeft}j restants
          </span>
        )}
      </div>
    </motion.div>
  );
}
